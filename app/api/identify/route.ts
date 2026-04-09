import { NextRequest, NextResponse } from "next/server";
import { analyzePillImage } from "@/lib/gemini";
import {
  loadDrugDatabase,
  loadGlobalDatabase,
  searchDrug,
  searchGlobalDrug,
  type DrugRecord,
  type GlobalDrugRecord,
} from "@/lib/drugDatabase";

function lookupDrugs(searchTerms: string[], drugName: string) {
  const koreanDb = loadDrugDatabase();
  const globalDb = loadGlobalDatabase();

  let matched: DrugRecord[] = [];
  for (const term of searchTerms) {
    matched.push(...searchDrug(term, koreanDb, 3));
  }
  if (drugName && matched.length === 0) {
    matched.push(...searchDrug(drugName, koreanDb, 3));
  }
  const seenK = new Set<string>();
  matched = matched.filter((d) => {
    if (seenK.has(d.itemSeq)) return false;
    seenK.add(d.itemSeq);
    return true;
  });

  let global: GlobalDrugRecord[] = [];
  for (const term of searchTerms) {
    global.push(...searchGlobalDrug(term, globalDb, 3));
  }
  if (drugName && global.length === 0) {
    global.push(...searchGlobalDrug(drugName, globalDb, 3));
  }
  const seenG = new Set<string>();
  global = global.filter((d) => {
    const key = d.itemName + d.genericName;
    if (seenG.has(key)) return false;
    seenG.add(key);
    return true;
  });

  return {
    matchedDrugs: matched.slice(0, 3),
    globalMatches: global.slice(0, 3),
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 });
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

    // Gemini returns array of pills now
    const pills = await analyzePillImage(base64, file.type);

    // DB lookup for each pill type
    const results = pills.map((pill) => ({
      analysis: pill,
      ...lookupDrugs(pill.searchTerms, pill.drugName),
    }));

    return NextResponse.json({
      pills: results,
      count: pills.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Identify error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
