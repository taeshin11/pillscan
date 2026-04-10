import { NextRequest, NextResponse } from "next/server";
import { analyzePillImage } from "@/lib/gemini";
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

  // 1. Primary: shape + color + imprint attribute search
  const attrMatches = searchByAttributes(
    { shape: pill.shape, color: pill.color, imprint: pill.imprint },
    pillIdDb,
    5
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
    attrMatches: enriched.slice(0, 5),
    nameMatches: nameMatches.slice(0, 3),
    globalMatches: globalMatches.slice(0, 3),
    // searchMethod tells UI which path was used
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

    const pills = await analyzePillImage(imageInputs);

    const results = pills.map((pill) => ({
      analysis: pill,
      ...lookupAll(pill),
      // needsClearerPhoto: true if imprint was seen but unreadable AND no confident match
      needsClearerPhoto: pill.imprintUnclear && pill.confidence < 70,
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
