import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";

const SERVICE_KEY = "11ec65e826b3c7b2a5e77f0e141fa01a768c42eecf09c1cc82080ea1dd86d831";
const API_URL = "http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService03/getMdcinGrnIdntfcInfoList03";
const DATA_PATH = path.join(process.cwd(), "data", "pill_identification.json");
const META_PATH = path.join(process.cwd(), "data", "pill_id_meta.json");

interface Meta {
  lastRefresh: string;
  totalCount: number;
  apiStatus: "active" | "expired" | "error";
}

function loadMeta(): Meta {
  try {
    if (existsSync(META_PATH)) return JSON.parse(readFileSync(META_PATH, "utf-8"));
  } catch {}
  return { lastRefresh: "never", totalCount: 0, apiStatus: "active" };
}

function saveMeta(meta: Meta) {
  try { writeFileSync(META_PATH, JSON.stringify(meta, null, 2)); } catch {}
}

export async function GET(req: NextRequest) {
  // Simple auth: require secret header to prevent abuse
  const secret = req.headers.get("x-refresh-secret");
  if (secret !== (process.env.REFRESH_SECRET || "pillscan-refresh-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meta = loadMeta();

  // Don't refresh more than once per day
  const lastDate = new Date(meta.lastRefresh).getTime();
  const now = Date.now();
  if (now - lastDate < 24 * 60 * 60 * 1000 && meta.apiStatus !== "error") {
    return NextResponse.json({
      status: "skipped",
      reason: "Already refreshed today",
      lastRefresh: meta.lastRefresh,
      totalCount: meta.totalCount,
      apiStatus: meta.apiStatus,
    });
  }

  try {
    // Test API availability
    const testRes = await fetch(
      `${API_URL}?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=1&type=json`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (testRes.status === 403 || testRes.status === 401) {
      meta.apiStatus = "expired";
      meta.lastRefresh = new Date().toISOString();
      saveMeta(meta);
      return NextResponse.json({
        status: "api_expired",
        message: "API key expired or unauthorized. Using cached data.",
        cachedRecords: meta.totalCount,
      });
    }

    if (!testRes.ok) {
      meta.apiStatus = "error";
      saveMeta(meta);
      return NextResponse.json({
        status: "api_error",
        httpStatus: testRes.status,
        cachedRecords: meta.totalCount,
      });
    }

    const testData = await testRes.json();
    const totalCount = testData?.body?.totalCount || 0;

    // If total count hasn't changed, skip full refresh
    if (totalCount === meta.totalCount && meta.totalCount > 0) {
      meta.lastRefresh = new Date().toISOString();
      meta.apiStatus = "active";
      saveMeta(meta);
      return NextResponse.json({
        status: "no_change",
        totalCount,
      });
    }

    // Incremental: only fetch new pages beyond what we have
    const existing = existsSync(DATA_PATH)
      ? JSON.parse(readFileSync(DATA_PATH, "utf-8"))
      : [];
    const existingSeqs = new Set(existing.map((r: any) => r.itemSeq));

    const PAGE_SIZE = 100;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    let added = 0;

    // Fetch from the last pages (newest items) first
    for (let page = totalPages; page >= 1 && added < 500; page--) {
      const res = await fetch(
        `${API_URL}?serviceKey=${SERVICE_KEY}&pageNo=${page}&numOfRows=${PAGE_SIZE}&type=json`,
        { signal: AbortSignal.timeout(15000) }
      );
      if (!res.ok) break;

      const data = await res.json();
      let items = data?.body?.items || [];
      if (!Array.isArray(items)) {
        items = items?.item || [];
        if (!Array.isArray(items)) items = [items];
      }

      let pageNew = 0;
      for (const item of items) {
        const seq = String(item.ITEM_SEQ || "");
        if (seq && !existingSeqs.has(seq)) {
          existing.push({
            itemSeq: seq,
            itemName: item.ITEM_NAME || "",
            entpName: item.ENTP_NAME || "",
            shape: item.DRUG_SHAPE || "",
            color1: item.COLOR_CLASS1 || "",
            color2: item.COLOR_CLASS2 || "",
            markFront: (item.MARK_CODE_FRONT || item.PRINT_FRONT || "").trim(),
            markBack: (item.MARK_CODE_BACK || item.PRINT_BACK || "").trim(),
            lineFront: item.LINE_FRONT || "",
            lineBack: item.LINE_BACK || "",
            lengLong: item.LENG_LONG || "",
            lengShort: item.LENG_SHORT || "",
            thick: item.THICK || "",
            itemImage: item.ITEM_IMAGE || "",
            className: item.CLASS_NAME || "",
            etcOtc: item.ETC_OTC_NAME || "",
            formCode: item.FORM_CODE_NAME || "",
            chart: item.CHART || "",
          });
          existingSeqs.add(seq);
          pageNew++;
          added++;
        }
      }

      // If no new items on this page, older pages won't have any either
      if (pageNew === 0) break;

      await new Promise((r) => setTimeout(r, 150));
    }

    // Save updated data
    if (added > 0) {
      writeFileSync(DATA_PATH, JSON.stringify(existing, null, 2));
    }

    meta.lastRefresh = new Date().toISOString();
    meta.totalCount = existing.length;
    meta.apiStatus = "active";
    saveMeta(meta);

    return NextResponse.json({
      status: "refreshed",
      newRecords: added,
      totalRecords: existing.length,
      apiTotalCount: totalCount,
    });
  } catch (error: any) {
    meta.apiStatus = "error";
    saveMeta(meta);
    return NextResponse.json({
      status: "error",
      message: error.message,
      cachedRecords: meta.totalCount,
    }, { status: 500 });
  }
}
