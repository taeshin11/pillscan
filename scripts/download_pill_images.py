#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Download all pill reference images from MFDS pill_identification.json.
Output: data/pill_images/{itemSeq}.jpg

These reference images are used for visual comparison during identification.
"""

import json
import os
import sys
import time
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

if sys.stdout.encoding != 'utf-8':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except: pass

ROOT = Path(__file__).parent.parent
DATA = ROOT / "data"
IMG_DIR = DATA / "pill_images"
PILL_DB = DATA / "pill_identification.json"
PROGRESS = DATA / "image_download_progress.json"

THREADS = 8
TIMEOUT = 15


def load_pills():
    with open(PILL_DB, encoding='utf-8') as f:
        return json.load(f)


def load_progress():
    if PROGRESS.exists():
        with open(PROGRESS, encoding='utf-8') as f:
            return set(json.load(f))
    return set()


def save_progress(done):
    with open(PROGRESS, 'w', encoding='utf-8') as f:
        json.dump(list(done), f)


def download_one(item_seq, url):
    try:
        out_path = IMG_DIR / f"{item_seq}.jpg"
        if out_path.exists() and out_path.stat().st_size > 1000:
            return item_seq, "exists"

        r = requests.get(url, timeout=TIMEOUT, headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://nedrug.mfds.go.kr/",
        })
        if r.status_code == 200 and len(r.content) > 1000:
            with open(out_path, 'wb') as f:
                f.write(r.content)
            return item_seq, "ok"
        return item_seq, f"http_{r.status_code}"
    except Exception as e:
        return item_seq, f"err_{str(e)[:30]}"


def main():
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    pills = load_pills()
    done = load_progress()

    print(f"[Download] {len(pills)} pills total, {len(done)} already done")

    targets = [
        (p['itemSeq'], p['itemImage'])
        for p in pills
        if p.get('itemImage') and p['itemSeq'] not in done
    ]
    print(f"[Download] {len(targets)} to download")

    if not targets:
        print("[Done] No targets")
        return

    completed = 0
    failed = 0
    skipped = 0

    with ThreadPoolExecutor(max_workers=THREADS) as ex:
        futures = {ex.submit(download_one, seq, url): seq for seq, url in targets}
        for future in as_completed(futures):
            seq = futures[future]
            try:
                _, status = future.result()
                if status in ("ok", "exists"):
                    done.add(seq)
                    completed += 1
                else:
                    failed += 1

                if completed % 100 == 0 and completed > 0:
                    save_progress(done)
                    pct = 100 * (completed + failed) / len(targets)
                    print(f"  {completed + failed}/{len(targets)} ({pct:.1f}%) — ok:{completed} fail:{failed}")
            except Exception as e:
                failed += 1
                print(f"  Error processing {seq}: {e}")

    save_progress(done)

    # Stats
    total_files = len(list(IMG_DIR.glob("*.jpg")))
    total_size_mb = sum(f.stat().st_size for f in IMG_DIR.glob("*.jpg")) / (1024 * 1024)
    print(f"\n[Done]")
    print(f"  Successful: {completed}")
    print(f"  Failed: {failed}")
    print(f"  Total files on disk: {total_files}")
    print(f"  Total size: {total_size_mb:.1f} MB")


if __name__ == "__main__":
    main()
