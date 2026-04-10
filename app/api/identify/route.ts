import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { analyzePillImage, visualReRank, type VisualMatchCandidate } from "@/lib/gemini";
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

const PILL_IMAGES_DIR = path.join(process.cwd(), "data", "pill_images");

function loadReferenceImage(itemSeq: string): { data: string; mimeType: string } | null {
  try {
    const imgPath = path.join(PILL_IMAGES_DIR, `${itemSeq}.jpg`);
    if (!existsSync(imgPath)) return null;
    const buffer = readFileSync(imgPath);
    return { data: buffer.toString("base64"), mimeType: "image/jpeg" };
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

    // Step 1: Gemini extracts shape/color/imprint per pill type
    const pills = await analyzePillImage(imageInputs);

    // Step 2: For each pill, run attribute search + visual re-rank
    const results = await Promise.all(pills.map(async (pill) => {
      const lookup = lookupAll(pill);

      // Visual re-rank: only if we have attribute matches AND reference images
      let visualMatch: { bestSeq: string | null; confidence: number; reason: string } | null = null;

      if (lookup.searchMethod === "attributes" && lookup.attrMatches.length > 1) {
        // Load reference images for top 5 candidates
        const candidates: VisualMatchCandidate[] = [];
        for (const m of lookup.attrMatches.slice(0, 5)) {
          const refImg = loadReferenceImage(m.itemSeq);
          if (refImg) {
            candidates.push({
              itemSeq: m.itemSeq,
              itemName: m.itemName,
              imageData: refImg.data,
              mimeType: refImg.mimeType,
            });
          }
        }

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

      return {
        analysis: pill,
        ...lookup,
        attrMatches: reorderedMatches,
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
