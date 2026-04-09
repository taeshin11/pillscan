#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PillScan - International Drug Database Crawler
Fetches pill identification data from:
- OpenFDA (US FDA Drug Database) - free, no key required
- RxNorm (NIH) - free, no key required

Run: python scripts/crawl_international_drugs.py
Output: data/international_drugs.json
"""

import requests
import json
import time
import os
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "international_drugs.json"
PROGRESS_FILE = OUTPUT_DIR / "crawl_progress.json"


def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"openfda_skip": 0, "ndc_skip": 0}


def save_progress(p):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(p, f)


def fetch_openfda_labels(skip=0, limit=100):
    url = "https://api.fda.gov/drug/label.json"
    params = {"limit": limit, "skip": skip}
    resp = requests.get(url, params=params, timeout=30)
    if resp.status_code == 200:
        return resp.json()
    return None


def normalize_openfda_record(item):
    openfda = item.get("openfda", {})
    return {
        "source": "openfda",
        "itemName": ", ".join(openfda.get("brand_name", ["Unknown"])),
        "genericName": ", ".join(openfda.get("generic_name", [])),
        "manufacturer": ", ".join(openfda.get("manufacturer_name", [])),
        "ndc": openfda.get("product_ndc", []),
        "route": ", ".join(openfda.get("route", [])),
        "dosageForm": "",
        "indications": " ".join(item.get("indications_and_usage", [])[:1])[:500],
        "warnings": " ".join(item.get("warnings", [])[:1])[:500],
        "dosage": " ".join(item.get("dosage_and_administration", [])[:1])[:300],
        "sideEffects": " ".join(item.get("adverse_reactions", [])[:1])[:500],
        "interactions": " ".join(item.get("drug_interactions", [])[:1])[:300],
        "storage": " ".join(item.get("storage_and_handling", [])[:1])[:200],
    }


def fetch_openfda_ndc(skip=0, limit=100):
    url = "https://api.fda.gov/drug/ndc.json"
    params = {"limit": limit, "skip": skip}
    resp = requests.get(url, params=params, timeout=30)
    if resp.status_code == 200:
        return resp.json()
    return None


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    all_drugs = []
    progress = load_progress()

    print("[PillScan] Starting international drug database crawl...")

    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            all_drugs = json.load(f)
        print(f"  Resuming from {len(all_drugs)} existing records")

    # Source 1: OpenFDA Drug Labels
    print("\n[1/2] Fetching OpenFDA drug labels (up to 5000)...")
    skip = progress.get("openfda_skip", 0)
    max_records = 5000

    while skip < max_records:
        try:
            data = fetch_openfda_labels(skip=skip, limit=100)
            if not data or "results" not in data:
                print(f"  Reached end at skip={skip}")
                break

            results = data["results"]
            normalized = [normalize_openfda_record(r) for r in results]
            all_drugs.extend(normalized)
            skip += len(results)
            progress["openfda_skip"] = skip
            save_progress(progress)

            if skip % 500 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(all_drugs, f, ensure_ascii=False, indent=2)
                print(f"  Saved {len(all_drugs)} records (openfda labels: {skip})")

            time.sleep(0.2)

        except Exception as e:
            print(f"  Error at skip={skip}: {e}")
            time.sleep(2)
            break

    # Source 2: OpenFDA NDC
    print("\n[2/2] Fetching OpenFDA NDC products...")
    ndc_skip = progress.get("ndc_skip", 0)

    for _ in range(100):  # up to 10k NDC records
        try:
            data = fetch_openfda_ndc(skip=ndc_skip, limit=100)
            if not data or "results" not in data:
                break

            for item in data["results"]:
                brand = item.get("brand_name", "")
                generic = item.get("generic_name", "")
                if brand or generic:
                    all_drugs.append({
                        "source": "openfda_ndc",
                        "itemName": brand,
                        "genericName": generic,
                        "manufacturer": item.get("labeler_name", ""),
                        "ndc": [item.get("product_ndc", "")],
                        "route": (item.get("route") or [None])[0] or "",
                        "dosageForm": item.get("dosage_form", ""),
                        "indications": "",
                        "warnings": "",
                        "dosage": "",
                        "sideEffects": "",
                        "interactions": "",
                        "storage": "",
                    })

            ndc_skip += 100
            progress["ndc_skip"] = ndc_skip
            save_progress(progress)

            if ndc_skip % 1000 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(all_drugs, f, ensure_ascii=False, indent=2)
                print(f"  Saved {len(all_drugs)} records (NDC: {ndc_skip})")

            time.sleep(0.15)

        except Exception as e:
            print(f"  NDC error: {e}")
            time.sleep(2)
            break

    # Final save
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_drugs, f, ensure_ascii=False, indent=2)

    print(f"\n[Done] Total records: {len(all_drugs)}")
    sources = {}
    for d in all_drugs:
        s = d.get("source", "unknown")
        sources[s] = sources.get(s, 0) + 1
    print(f"  Sources: {sources}")
    print(f"  File: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
