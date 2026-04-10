import { NextRequest, NextResponse } from "next/server";
import { loadGlobalDatabase, searchGlobalDrug, type GlobalDrugRecord } from "@/lib/drugDatabase";

/** Fetch pill image from NIH RxImage API. Free, no key. */
async function fetchRxImage(name: string, ndc?: string): Promise<string | null> {
  try {
    // Try NDC first (more accurate)
    if (ndc) {
      const ndcClean = ndc.replace(/-/g, "");
      const r = await fetch(
        `https://rximage.nlm.nih.gov/api/rximage/1/rxnav?ndc=${ndcClean}&resolution=120`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (r.ok) {
        const d = await r.json();
        const img = d?.nlmRxImages?.[0]?.imageUrl;
        if (img) return img;
      }
    }

    // Fallback: search by name
    if (name) {
      const cleanName = name.split(/[\s,]/)[0].trim(); // first word
      const r = await fetch(
        `https://rximage.nlm.nih.gov/api/rximage/1/rxbase?name=${encodeURIComponent(cleanName)}&resolution=120`,
        { signal: AbortSignal.timeout(5000) }
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
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const db = loadGlobalDatabase();
  const results = searchGlobalDrug(q, db, 20);

  // Enrich top 5 with images (parallel)
  const top5 = results.slice(0, 5);
  const images = await Promise.all(
    top5.map((r) => fetchRxImage(r.itemName || r.genericName, r.ndc?.[0]))
  );
  const enriched: (GlobalDrugRecord & { image?: string })[] = results.map((r, i) => ({
    ...r,
    image: i < 5 ? images[i] || undefined : undefined,
  }));

  return NextResponse.json({ results: enriched, total: enriched.length });
}
