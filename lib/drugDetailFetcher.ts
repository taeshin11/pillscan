/**
 * Fetch detailed drug information from MFDS APIs at request time.
 * Used as fallback when local e약은요 cache doesn't have the drug.
 *
 * Sources tried in order:
 * 1. e약은요 API (DrbEasyDrugInfoService) — search by itemSeq
 * 2. 의약품 제품 허가 정보 (DrugPrdtPrmsnInfoService) — has all drugs
 */

const SERVICE_KEY = "11ec65e826b3c7b2a5e77f0e141fa01a768c42eecf09c1cc82080ea1dd86d831";

export interface FetchedDetail {
  itemName?: string;
  entpName?: string;
  efcyQesitm?: string;
  useMethodQesitm?: string;
  atpnWarnQesitm?: string;
  atpnQesitm?: string;
  intrcQesitm?: string;
  seQesitm?: string;
  depositMethodQesitm?: string;
  itemImage?: string;
  source?: "e약은요" | "허가정보";
}

const cache = new Map<string, FetchedDetail | null>();

export async function fetchDrugDetail(itemSeq: string, itemName?: string): Promise<FetchedDetail | null> {
  if (!itemSeq) return null;
  if (cache.has(itemSeq)) return cache.get(itemSeq)!;

  // Try 1: e약은요 by itemSeq
  try {
    const url = `http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?serviceKey=${SERVICE_KEY}&itemSeq=${itemSeq}&type=json&numOfRows=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const items = data?.body?.items;
      const item = Array.isArray(items) ? items[0] : items?.item?.[0] || items?.item;
      if (item && item.itemSeq) {
        const result: FetchedDetail = {
          itemName: item.itemName,
          entpName: item.entpName,
          efcyQesitm: stripHtml(item.efcyQesitm),
          useMethodQesitm: stripHtml(item.useMethodQesitm),
          atpnWarnQesitm: stripHtml(item.atpnWarnQesitm),
          atpnQesitm: stripHtml(item.atpnQesitm),
          intrcQesitm: stripHtml(item.intrcQesitm),
          seQesitm: stripHtml(item.seQesitm),
          depositMethodQesitm: stripHtml(item.depositMethodQesitm),
          itemImage: item.itemImage,
          source: "e약은요",
        };
        cache.set(itemSeq, result);
        return result;
      }
    }
  } catch {}

  // Try 2: 의약품 제품 허가 정보 (DrugPrdtPrmsnInfoService) — covers more drugs
  try {
    const url = `http://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService06/getDrugPrdtPrmsnDtlInq05?serviceKey=${SERVICE_KEY}&item_seq=${itemSeq}&type=json&numOfRows=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const items = data?.body?.items;
      const item = Array.isArray(items) ? items[0] : items?.item?.[0] || items?.item;
      if (item) {
        const result: FetchedDetail = {
          itemName: item.ITEM_NAME || item.itemName,
          entpName: item.ENTP_NAME || item.entpName,
          efcyQesitm: stripHtml(item.EE_DOC_DATA || item.efcyQesitm),
          useMethodQesitm: stripHtml(item.UD_DOC_DATA || item.useMethodQesitm),
          atpnWarnQesitm: stripHtml(item.NB_DOC_DATA || item.atpnWarnQesitm),
          source: "허가정보",
        };
        cache.set(itemSeq, result);
        return result;
      }
    }
  } catch {}

  cache.set(itemSeq, null);
  return null;
}

function stripHtml(text?: string): string {
  if (!text) return "";
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
