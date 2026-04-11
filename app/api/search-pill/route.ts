import { NextRequest, NextResponse } from "next/server";
import {
  loadPillIdDatabase,
  loadDrugDatabase,
  loadGlobalDatabase,
  enrichPillIdResults,
  searchByAttributes,
  searchDrug,
  searchGlobalDrug,
  type PillIdRecord,
} from "@/lib/drugDatabase";

/** Fetch pill image from NIH RxImage API. */
async function fetchRxImage(name: string, ndc?: string): Promise<string | null> {
  try {
    if (ndc) {
      const ndcClean = ndc.replace(/-/g, "");
      const r = await fetch(
        `https://rximage.nlm.nih.gov/api/rximage/1/rxnav?ndc=${ndcClean}&resolution=120`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (r.ok) {
        const d = await r.json();
        const img = d?.nlmRxImages?.[0]?.imageUrl;
        if (img) return img;
      }
    }
    if (name) {
      const cleanName = name.split(/[\s,]/)[0].trim();
      const r = await fetch(
        `https://rximage.nlm.nih.gov/api/rximage/1/rxbase?name=${encodeURIComponent(cleanName)}&resolution=120`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (r.ok) {
        const d = await r.json();
        const img = d?.nlmRxImages?.[0]?.imageUrl;
        if (img) return img;
      }
    }
  } catch {}
  return null;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const imprint = (params.get("imprint") || "").trim();
  const shape = (params.get("shape") || "").trim();
  const color = (params.get("color") || "").trim();
  const form = (params.get("form") || "").trim();
  const name = (params.get("name") || "").trim(); // free-text search

  if (!imprint && !shape && !color && !name) {
    return NextResponse.json({ error: "검색 조건을 입력해주세요." }, { status: 400 });
  }

  const pillIdDb = loadPillIdDatabase();
  const detailDb = loadDrugDatabase();
  const globalDb = loadGlobalDatabase();

  // ── Korean attribute search ──────────────────────────────
  let koreanResults: any[] = [];
  if (imprint || shape || color) {
    const matches = searchByAttributes(
      { imprint, shape, color },
      pillIdDb,
      20
    );
    koreanResults = enrichPillIdResults(matches, detailDb);
  }

  // ── Korean name search ───────────────────────────────────
  if (name) {
    // Find pills in pill_id DB whose name matches
    const nameMatches = pillIdDb
      .filter((p) => p.itemName?.toLowerCase().includes(name.toLowerCase()))
      .slice(0, 20);
    const enriched = enrichPillIdResults(nameMatches, detailDb);
    // Merge with korean results, dedupe
    const seen = new Set(koreanResults.map((r: any) => r.itemSeq));
    for (const r of enriched) {
      if (!seen.has(r.itemSeq)) {
        koreanResults.push(r);
        seen.add(r.itemSeq);
      }
    }
  }

  // ── Global (FDA) search by name only ─────────────────────
  let globalResults: any[] = [];
  if (name) {
    globalResults = searchGlobalDrug(name, globalDb, 10);
    // Enrich top 5 with NIH images
    const top5 = globalResults.slice(0, 5);
    const images = await Promise.all(
      top5.map((r) => fetchRxImage(r.itemName || r.genericName, r.ndc?.[0]))
    );
    globalResults = globalResults.map((r, i) => ({
      ...r,
      image: i < 5 ? images[i] || undefined : undefined,
      _origin: "global" as const,
    }));
  }

  // Mark Korean results origin
  koreanResults = koreanResults.map((r) => ({ ...r, _origin: "korean" as const }));

  // Combined unified result
  const combined = [
    ...koreanResults.slice(0, 15),
    ...globalResults.slice(0, 10),
  ];

  return NextResponse.json({
    results: combined,
    korean: koreanResults.slice(0, 15),
    global: globalResults,
    total: combined.length,
  });
}
