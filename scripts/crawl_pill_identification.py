#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
식약처 nedrug 낱알식별정보 크롤러
Source: https://nedrug.mfds.go.kr/searchDrug (public, no key required)
Output: data/pill_identification.json

Fields collected:
  itemSeq    - 품목기준코드 (links to e약은요 DB)
  itemName   - 약품명
  entpName   - 업체명
  shape      - 모양 (DRUG_SHAPE)
  color      - 색상 (COLOR_CLASS)
  markFront  - 식별표시 앞면 (MARK_CODE / PRINT_FRONT)
  markBack   - 식별표시 뒷면
  lineFront  - 분할선 앞면
  lineBack   - 분할선 뒷면
  itemImage  - 이미지 URL
  className  - 분류명
  etcOtc     - 전문/일반
"""

import requests
import json
import time
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "pill_identification.json"
PROGRESS_FILE = OUTPUT_DIR / "pill_id_progress.json"

SESSION = requests.Session()
SESSION.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    'Referer': 'https://nedrug.mfds.go.kr/searchDrug',
    'X-Requested-With': 'XMLHttpRequest',
})

# Drug shapes to iterate over (covers all pill types)
SHAPES = ['원형', '타원형', '장방형', '삼각형', '사각형', '마름모형', '오각형', '육각형', '팔각형', '반원형', '기타']

IMAGE_BASE = "https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/"


def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, encoding='utf-8') as f:
            return json.load(f)
    return {"shape_idx": 0, "page": 1, "done_shapes": []}


def save_progress(p):
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(p, f, ensure_ascii=False)


def fetch_page(shape, page, limit=100):
    r = SESSION.get(
        'https://nedrug.mfds.go.kr/searchDrug',
        params={
            'page': page,
            'limit': limit,
            'drugShape': shape,
            'inOrder': 'itemSeq',
            'order': 'asc',
        },
        timeout=20
    )
    r.raise_for_status()
    return r.json()


def normalize(item):
    item_seq = item.get('ITEM_SEQ', '')
    big_image = item.get('BIG_ITEM_IMAGE_DOCID', '') or item.get('SMALL_ITEM_IMAGE_DOCID', '')
    image_url = f"{IMAGE_BASE}{big_image}" if big_image else ''

    # MARK_CODE is comma-separated list; PRINT_FRONT is the actual printed text
    mark_front = (item.get('PRINT_FRONT') or item.get('MARK_CODE') or '').strip().strip(',')
    mark_back  = (item.get('PRINT_BACK') or '').strip().strip(',')

    return {
        'itemSeq':   item_seq,
        'itemName':  item.get('ITEM_NAME', ''),
        'entpName':  item.get('ENTP_NAME', ''),
        'shape':     item.get('DRUG_SHAPE', ''),
        'color':     item.get('COLOR_CLASS', ''),
        'markFront': mark_front,
        'markBack':  mark_back,
        'lineFront': item.get('LINE_FRONT', '').strip().strip(','),
        'lineBack':  item.get('LINE_BACK', '').strip().strip(','),
        'itemImage': image_url,
        'className': item.get('CLASS_NO_NAME', ''),
        'etcOtc':    item.get('ETC_OTC_CODE_NAME', ''),
    }


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    all_records = []
    seen_seqs = set()
    progress = load_progress()

    # Resume from existing data
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, encoding='utf-8') as f:
            all_records = json.load(f)
        seen_seqs = {r['itemSeq'] for r in all_records}
        print(f"[Resume] {len(all_records)} records loaded")

    for shape_idx in range(progress['shape_idx'], len(SHAPES)):
        shape = SHAPES[shape_idx]
        if shape in progress.get('done_shapes', []):
            continue

        print(f"\n[Shape {shape_idx+1}/{len(SHAPES)}] {shape}")
        page = progress['page'] if shape_idx == progress['shape_idx'] else 1

        while True:
            try:
                data = fetch_page(shape, page)
                items = data.get('list', [])
                if not items:
                    break

                added = 0
                for item in items:
                    rec = normalize(item)
                    if rec['itemSeq'] and rec['itemSeq'] not in seen_seqs:
                        all_records.append(rec)
                        seen_seqs.add(rec['itemSeq'])
                        added += 1

                print(f"  page {page}: +{added} new ({len(all_records)} total)")
                page += 1

                # Save every 10 pages
                if page % 10 == 0:
                    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                        json.dump(all_records, f, ensure_ascii=False, indent=2)
                    progress['shape_idx'] = shape_idx
                    progress['page'] = page
                    save_progress(progress)

                time.sleep(0.2)

                # If fewer items than limit, we're done with this shape
                if len(items) < 100:
                    break

            except Exception as e:
                print(f"  Error at page {page}: {e}")
                time.sleep(3)
                break

        progress['done_shapes'] = progress.get('done_shapes', []) + [shape]
        progress['shape_idx'] = shape_idx + 1
        progress['page'] = 1
        save_progress(progress)

    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)

    print(f"\n[Done] {len(all_records)} pill identification records")

    # Stats
    shapes = {}
    colors = {}
    with_imprint = 0
    for r in all_records:
        s = r.get('shape') or 'unknown'
        shapes[s] = shapes.get(s, 0) + 1
        c = r.get('color') or 'unknown'
        colors[c] = colors.get(c, 0) + 1
        if r.get('markFront') or r.get('markBack'):
            with_imprint += 1

    print(f"Shapes: {dict(sorted(shapes.items(), key=lambda x: -x[1])[:6])}")
    print(f"Colors: {dict(sorted(colors.items(), key=lambda x: -x[1])[:6])}")
    print(f"With imprint: {with_imprint}/{len(all_records)}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
