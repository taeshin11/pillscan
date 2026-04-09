#!/usr/bin/env python3
"""
PillScan - International Drug Database Crawler
Fetches pill identification data from:
- OpenFDA (US FDA Drug Database) - free, no key required
- RxNorm (NIH) - free, no key required
- DailyMed (NIH) - free, no key required

Run: python scripts/crawl_international_drugs.py
Output: data/international_drugs.json
"""

import requests
import json
import time
import os
import sys
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "international_drugs.json"
PROGRESS_FILE = OUTPUT_DIR / "crawl_progress.json"

def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {"skip": 0, "total": 0, "source": "openfda"}

def save_progress(p):
    with open(PROGRESS_FILE, "w") as f:
        json.dump(p, f)

def fetch_openfda_pills(limit=1000, skip=0):
    """Fetch pill imprint data from OpenFDA drug label API."""
    url = "https://api.fda.gov/drug/ndc.json"
    params = {
        "search": "product_type:HUMAN+OTC+DRUG",
        "limit": min(limit, 1000),
        "skip": skip,
    }
    resp = requests.get(url, params=params, timeout=30)
    if resp.status_code == 200:
        return resp.json()
    return None

def fetch_openfda_labels(skip=0, limit=100):
    """Fetch structured drug label data."""
    url = "https://api.fda.gov/drug/label.json"
    params = {
        "search": "openfda.product_type:HUMAN+OTC+DRUG",
        "limit": limit,
        "skip": skip,
    }
    resp = requests.get(url, params=params, timeout=30)
    if resp.status_code == 200:
        return resp.json()
    return None

def normalize_openfda_record(item):
    """Normalize an OpenFDA label record to our schema."""
    openfda = item.get("openfda", {})
    return {
        "source": "openfda",
        "itemName": ", ".join(openfda.get("brand_name", ["Unknown"])),
        "genericName": ", ".join(openfda.get("generic_name", [])),
        "manufacturer": ", ".join(openfda.get("manufacturer_name", [])),
        "ndc": openfda.get("product_ndc", []),
        "route": ", ".join(openfda.get("route", [])),
        "dosageForm": ", ".join(openfda.get("dosage_and_administration", [])[:1]),
        "indications": " ".join(item.get("indications_and_usage", [])[:1])[:500],
        "warnings": " ".join(item.get("warnings", [])[:1])[:500],
        "dosage": " ".join(item.get("dosage_and_administration", [])[:1])[:300],
        "sideEffects": " ".join(item.get("adverse_reactions", [])[:1])[:500],
        "interactions": " ".join(item.get("drug_interactions", [])[:1])[:300],
        "storage": " ".join(item.get("storage_and_handling", [])[:1])[:200],
    }

def fetch_rxnorm_drugs(start=0, batch=100):
    """Fetch drug concepts from RxNorm."""
    url = "https://rxnav.nlm.nih.gov/REST/allconcepts.json"
    params = {"tty": "IN+BN+SCD+SBD"}
    resp = requests.get(url, params=params, timeout=60)
    if resp.status_code == 200:
        data = resp.json()
        concepts = data.get("minConceptGroup", {}).get("minConcept", [])
        return concepts[start:start+batch]
    return []

def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    all_drugs = []
    progress = load_progress()

    print(f"🌍 Starting international drug database crawl...")
    print(f"   Output: {OUTPUT_FILE}")

    # Load existing data
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE) as f:
            all_drugs = json.load(f)
        print(f"   Resuming from {len(all_drugs)} existing records")

    # --- Source 1: OpenFDA Drug Labels ---
    print("\n📦 [1/2] Fetching OpenFDA drug labels...")
    skip = progress.get("openfda_skip", 0)
    max_records = 5000

    while skip < max_records:
        try:
            data = fetch_openfda_labels(skip=skip, limit=100)
            if not data or "results" not in data:
                print(f"   Reached end at skip={skip}")
                break

            results = data["results"]
            normalized = [normalize_openfda_record(r) for r in results]
            all_drugs.extend(normalized)

            skip += len(results)
            progress["openfda_skip"] = skip
            save_progress(progress)

            print(f"   ✓ Fetched {skip} / {max_records} records ({len(all_drugs)} total)")

            # Save periodically
            if skip % 500 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(all_drugs, f, ensure_ascii=False, indent=2)
                print(f"   💾 Saved {len(all_drugs)} records")

            time.sleep(0.2)  # be polite to the API

        except Exception as e:
            print(f"   ⚠️  Error at skip={skip}: {e}")
            time.sleep(2)
            break

    # --- Source 2: OpenFDA NDC Database ---
    print("\n📦 [2/2] Fetching OpenFDA NDC (pill products)...")
    ndc_skip = progress.get("ndc_skip", 0)

    for attempt in range(50):  # up to 50k NDC records
        try:
            data = fetch_openfda_pills(limit=100, skip=ndc_skip)
            if not data or "results" not in data:
                break

            for item in data["results"]:
                record = {
                    "source": "openfda_ndc",
                    "itemName": item.get("brand_name", ""),
                    "genericName": item.get("generic_name", ""),
                    "manufacturer": item.get("labeler_name", ""),
                    "ndc": [item.get("product_ndc", "")],
                    "route": item.get("route", [None])[0] or "",
                    "dosageForm": item.get("dosage_form", ""),
                    "indications": "",
                    "warnings": "",
                    "dosage": "",
                    "sideEffects": "",
                    "interactions": "",
                    "storage": "",
                }
                if record["itemName"]:
                    all_drugs.append(record)

            ndc_skip += 100
            progress["ndc_skip"] = ndc_skip
            save_progress(progress)

            if attempt % 10 == 0:
                print(f"   ✓ NDC: {ndc_skip} fetched ({len(all_drugs)} total)")
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(all_drugs, f, ensure_ascii=False, indent=2)

            time.sleep(0.15)

        except Exception as e:
            print(f"   ⚠️  NDC error: {e}")
            time.sleep(2)
            break

    # Final save
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_drugs, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Crawl complete! Total records: {len(all_drugs)}")
    print(f"   Saved to: {OUTPUT_FILE}")

    # Summary
    sources = {}
    for d in all_drugs:
        s = d.get("source", "unknown")
        sources[s] = sources.get(s, 0) + 1
    print(f"   Sources: {sources}")

if __name__ == "__main__":
    main()
