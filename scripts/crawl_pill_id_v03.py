#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
식약처 의약품 낱알 식별 정보 크롤러 (API v03)
Endpoint: MdcinGrnIdntfcInfoService03/getMdcinGrnIdntfcInfoList03
Output: data/pill_identification.json
"""

import requests
import json
import time
import math
import sys
from pathlib import Path

if sys.stdout.encoding != 'utf-8':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except: pass

OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "pill_identification.json"
PROGRESS_FILE = OUTPUT_DIR / "pill_id_progress.json"

SERVICE_KEY = "11ec65e826b3c7b2a5e77f0e141fa01a768c42eecf09c1cc82080ea1dd86d831"
BASE_URL = "http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService03/getMdcinGrnIdntfcInfoList03"
PAGE_SIZE = 100


def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, encoding='utf-8') as f:
            return json.load(f)
    return {"page": 1, "total_count": 0, "collected": 0}


def save_progress(p):
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False)


def fetch_page(page):
    r = requests.get(BASE_URL, params={
        'serviceKey': SERVICE_KEY,
        'pageNo': page,
        'numOfRows': PAGE_SIZE,
        'type': 'json',
    }, timeout=30)
    r.raise_for_status()
    return r.json()


def extract_items(data):
    body = data.get('body', {})
    items = body.get('items', [])
    if isinstance(items, list):
        return items, int(body.get('totalCount', 0))
    elif isinstance(items, dict):
        item_list = items.get('item', [])
        if isinstance(item_list, dict):
            item_list = [item_list]
        return item_list, int(body.get('totalCount', 0))
    return [], 0


def normalize(item):
    return {
        'itemSeq':    str(item.get('ITEM_SEQ', '')),
        'itemName':   item.get('ITEM_NAME', ''),
        'entpName':   item.get('ENTP_NAME', ''),
        'shape':      item.get('DRUG_SHAPE', ''),
        'color1':     item.get('COLOR_CLASS1', ''),
        'color2':     item.get('COLOR_CLASS2', ''),
        'markFront':  (item.get('MARK_CODE_FRONT') or item.get('PRINT_FRONT') or item.get('MARK_CODE_FRONT_ANAL') or '').strip(),
        'markBack':   (item.get('MARK_CODE_BACK') or item.get('PRINT_BACK') or item.get('MARK_CODE_BACK_ANAL') or '').strip(),
        'lineFront':  item.get('LINE_FRONT', ''),
        'lineBack':   item.get('LINE_BACK', ''),
        'lengLong':   item.get('LENG_LONG', ''),
        'lengShort':  item.get('LENG_SHORT', ''),
        'thick':      item.get('THICK', ''),
        'itemImage':  item.get('ITEM_IMAGE', ''),
        'className':  item.get('CLASS_NAME', ''),
        'etcOtc':     item.get('ETC_OTC_NAME', ''),
        'formCode':   item.get('FORM_CODE_NAME', ''),
        'chart':      item.get('CHART', ''),
    }


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    progress = load_progress()
    all_records = []
    seen = set()

    if OUTPUT_FILE.exists() and progress.get('collected', 0) > 100:
        with open(OUTPUT_FILE, encoding='utf-8') as f:
            all_records = json.load(f)
        seen = {r['itemSeq'] for r in all_records if r.get('itemSeq')}
        print(f"[Resume] {len(all_records)} records loaded")

    # Get total count
    print("[PillID v03] Fetching page 1...")
    data = fetch_page(1)
    items, total_count = extract_items(data)
    total_pages = math.ceil(total_count / PAGE_SIZE)
    print(f"[PillID v03] Total: {total_count} records, {total_pages} pages")

    if total_count == 0:
        print("[Error] No records returned")
        return

    start_page = progress.get('page', 1)

    for page in range(start_page, total_pages + 1):
        try:
            if page > 1:
                data = fetch_page(page)
                items, _ = extract_items(data)

            added = 0
            for item in items:
                rec = normalize(item)
                if rec['itemSeq'] and rec['itemSeq'] not in seen:
                    all_records.append(rec)
                    seen.add(rec['itemSeq'])
                    added += 1

            progress['page'] = page + 1
            progress['collected'] = len(all_records)
            progress['total_count'] = total_count

            if page % 10 == 0 or page == total_pages:
                with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                    json.dump(all_records, f, ensure_ascii=False, indent=2)
                save_progress(progress)
                print(f"  Page {page}/{total_pages} | +{added} | Total: {len(all_records)}")

            time.sleep(0.15)

        except Exception as e:
            print(f"  [Error] Page {page}: {e}")
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(all_records, f, ensure_ascii=False, indent=2)
            save_progress(progress)
            time.sleep(3)
            continue

    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)
    save_progress(progress)

    # Stats
    shapes = {}
    colors = {}
    with_mark = 0
    for r in all_records:
        s = r.get('shape') or 'N/A'
        shapes[s] = shapes.get(s, 0) + 1
        c = r.get('color1') or 'N/A'
        colors[c] = colors.get(c, 0) + 1
        if r.get('markFront') or r.get('markBack'):
            with_mark += 1

    print(f"\n[Done] {len(all_records)} pill identification records")
    top_shapes = dict(sorted(shapes.items(), key=lambda x: -x[1])[:8])
    top_colors = dict(sorted(colors.items(), key=lambda x: -x[1])[:8])
    print(f"  Shapes: {top_shapes}")
    print(f"  Colors: {top_colors}")
    print(f"  With imprint: {with_mark}/{len(all_records)}")


if __name__ == '__main__':
    main()
