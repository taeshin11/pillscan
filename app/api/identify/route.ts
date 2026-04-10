import { NextRequest, NextResponse } from "next/server";
import { analyzePillImage, visualReRank, type VisualMatchCandidate } from "@/lib/gemini";
import { callInferenceServer, enhanceImage } from "@/lib/inferenceServer";
import { fetchDrugDetail } from "@/lib/drugDetailFetcher";
import {
  loadDrugDatabase,
  loadPillIdDatabase,
  loadGlobalDatabase,
  searchByAttributes,
  enrichPillIdResults,
  searchDrug,
  searchGlobalDrug,
  type DrugRecord,
  type GlobalDrugRecord,
} from "@/lib/drugDatabase";

/** Fetch reference image from MFDS URL and return as base64. */
async function fetchReferenceImage(url: string): Promise<{ data: string; mimeType: string } | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://nedrug.mfds.go.kr/" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 1000) return null;
    return {
      data: Buffer.from(buffer).toString("base64"),
      mimeType: res.headers.get("content-type") || "image/jpeg",
    };
  } catch {
    return null;
  }
}

function lookupAll(pill: {
  shape: string;
  color: string;
  imprint: string;
  drugName: string;
  searchTerms: string[];
}) {
  const koreanDb = loadDrugDatabase();
  const pillIdDb = loadPillIdDatabase();
  const globalDb = loadGlobalDatabase();

  // 1. Primary: shape + color + imprint attribute search (top 8 for re-rank)
  const attrMatches = searchByAttributes(
    { shape: pill.shape, color: pill.color, imprint: pill.imprint },
    pillIdDb,
    8
  );
  const enriched = enrichPillIdResults(attrMatches, koreanDb);

  // 2. Fallback: name-based Korean search
  let nameMatches: DrugRecord[] = [];
  if (enriched.length === 0) {
    for (const term of pill.searchTerms) {
      nameMatches.push(...searchDrug(term, koreanDb, 3));
    }
    if (nameMatches.length === 0 && pill.drugName !== "Unknown") {
      nameMatches.push(...searchDrug(pill.drugName, koreanDb, 3));
    }
    const seen = new Set<string>();
    nameMatches = nameMatches.filter((d) => {
      if (seen.has(d.itemSeq)) return false;
      seen.add(d.itemSeq);
      return true;
    });
  }

  // 3. Global DB fallback
  let globalMatches: GlobalDrugRecord[] = [];
  if (enriched.length === 0 && nameMatches.length === 0) {
    for (const term of pill.searchTerms) {
      globalMatches.push(...searchGlobalDrug(term, globalDb, 3));
    }
    const seen = new Set<string>();
    globalMatches = globalMatches.filter((d) => {
      const key = d.itemName + d.genericName;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return {
    attrMatches: enriched,
    nameMatches: nameMatches.slice(0, 3),
    globalMatches: globalMatches.slice(0, 3),
    searchMethod: enriched.length > 0 ? "attributes" : nameMatches.length > 0 ? "name" : "global",
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("image") as File[];

    if (!files.length) return NextResponse.json({ error: "No image provided" }, { status: 400 });
    if (files.length > 4) return NextResponse.json({ error: "Maximum 4 images" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const imageInputs: { data: string; mimeType: string }[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 });
      if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      imageInputs.push({
        data: Buffer.from(await file.arrayBuffer()).toString("base64"),
        mimeType: file.type,
      });
    }

    // Step -1: Apply server-side image enhancement (CLAHE + bilateral + edge boost)
    // for better imprint readability — this is the DexiNed-inspired preprocessing
    const enhancedInputs = await Promise.all(
      imageInputs.map(async (img) => {
        const enh = await enhanceImage(img.data, img.mimeType);
        return enh || img;
      })
    );

    // Step 0: Try local inference server (CLIP + YOLO) on enhanced images
    const inferenceResults = await Promise.all(
      enhancedInputs.map((img) => callInferenceServer(img.data, img.mimeType))
    );

    // Step 1: Gemini extracts shape/color/imprint from enhanced images
    const pills = await analyzePillImage(enhancedInputs);

    // Inject inference server results into the first pill
    // (since Gemini gives N pills but inference is global per image)
    const inferenceVisual = inferenceResults
      .flatMap((r) => r?.visual_matches || [])
      .sort((a, b) => b.similarity - a.similarity);
    const inferenceImprint = inferenceResults
      .map((r) => r?.imprint)
      .filter(Boolean)
      .join(" ");

    // If Gemini missed the imprint but YOLO read it, use YOLO's
    if (inferenceImprint && pills[0] && !pills[0].imprint) {
      pills[0].imprint = inferenceImprint;
      pills[0].imprintUnclear = false;
    }

    // Step 2: For each pill, run attribute search + visual re-rank
    const results = await Promise.all(pills.map(async (pill, pillIdx) => {
      const lookup = lookupAll(pill);

      // Merge inference server visual matches into attrMatches (only for first pill)
      if (pillIdx === 0 && inferenceVisual.length > 0) {
        const koreanDb = loadDrugDatabase();
        const inferenceEnriched = inferenceVisual.slice(0, 5).map((v) => {
          const detail = koreanDb.find((d) => d.itemSeq === v.itemSeq);
          return { ...v, detail, _source: "clip" } as any;
        });
        // Prepend CLIP matches, then attribute matches (dedupe by itemSeq)
        const seen = new Set<string>(inferenceEnriched.map((m) => m.itemSeq));
        const combined = [
          ...inferenceEnriched,
          ...lookup.attrMatches.filter((m) => !seen.has(m.itemSeq)),
        ].slice(0, 8);
        lookup.attrMatches = combined as any;
        if (lookup.searchMethod === "name" || lookup.searchMethod === "global") {
          lookup.searchMethod = "attributes";
        }
      }

      // Visual re-rank: only if we have attribute matches AND reference images
      let visualMatch: { bestSeq: string | null; confidence: number; reason: string } | null = null;

      if (lookup.searchMethod === "attributes" && lookup.attrMatches.length > 1) {
        // Fetch reference images in parallel for top 5 candidates
        const top5 = lookup.attrMatches.slice(0, 5);
        const fetched = await Promise.all(
          top5.map(async (m) => {
            const refImg = await fetchReferenceImage(m.itemImage);
            return refImg ? {
              itemSeq: m.itemSeq,
              itemName: m.itemName,
              imageData: refImg.data,
              mimeType: refImg.mimeType,
            } : null;
          })
        );
        const candidates = fetched.filter((c): c is VisualMatchCandidate => c !== null);

        if (candidates.length >= 2) {
          try {
            visualMatch = await visualReRank(imageInputs, candidates);
          } catch (e) {
            console.warn("Visual re-rank failed:", e);
          }
        }
      }

      // Re-order attrMatches: put visual match first
      let reorderedMatches = lookup.attrMatches.slice(0, 5);
      if (visualMatch?.bestSeq) {
        const idx = reorderedMatches.findIndex((m) => m.itemSeq === visualMatch!.bestSeq);
        if (idx > 0) {
          const [best] = reorderedMatches.splice(idx, 1);
          reorderedMatches.unshift(best);
        }
      }

      // ⚡ Fill in missing detail by fetching from MFDS API at request time
      // (Many pill_identification records aren't in our local e약은요 cache)
      const enrichedMatches = await Promise.all(
        reorderedMatches.map(async (m: any) => {
          if (m.detail) return m; // already has full info
          const fetched = await fetchDrugDetail(m.itemSeq, m.itemName);
          if (fetched) {
            return {
              ...m,
              detail: {
                itemSeq: m.itemSeq,
                itemName: fetched.itemName || m.itemName,
                entpName: fetched.entpName || m.entpName,
                efcyQesitm: fetched.efcyQesitm || "",
                useMethodQesitm: fetched.useMethodQesitm || "",
                atpnWarnQesitm: fetched.atpnWarnQesitm || "",
                atpnQesitm: fetched.atpnQesitm || "",
                intrcQesitm: fetched.intrcQesitm || "",
                seQesitm: fetched.seQesitm || "",
                depositMethodQesitm: fetched.depositMethodQesitm || "",
                itemImage: fetched.itemImage || m.itemImage || "",
              },
              _fetchedFrom: fetched.source,
            };
          }
          return m;
        })
      );

      return {
        analysis: pill,
        ...lookup,
        attrMatches: enrichedMatches,
        visualMatch,
        needsClearerPhoto: pill.imprintUnclear && pill.confidence < 70 && !visualMatch?.bestSeq,
      };
    }));

    return NextResponse.json({
      pills: results,
      count: pills.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Identify error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
