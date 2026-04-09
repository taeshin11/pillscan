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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const analysis = await analyzePillImage(base64, file.type);

    // Search Korean DB
    const koreanDb = loadDrugDatabase();
    let matchedDrugs: DrugRecord[] = [];
    for (const term of analysis.searchTerms) {
      matchedDrugs.push(...searchDrug(term, koreanDb, 3));
    }
    if (analysis.drugName && matchedDrugs.length === 0) {
      matchedDrugs.push(...searchDrug(analysis.drugName, koreanDb, 3));
    }
    const seenKorean = new Set<string>();
    matchedDrugs = matchedDrugs.filter((d) => {
      if (seenKorean.has(d.itemSeq)) return false;
      seenKorean.add(d.itemSeq);
      return true;
    });

    // Search Global DB
    const globalDb = loadGlobalDatabase();
    let globalMatches: GlobalDrugRecord[] = [];
    for (const term of analysis.searchTerms) {
      globalMatches.push(...searchGlobalDrug(term, globalDb, 3));
    }
    if (analysis.drugName && globalMatches.length === 0) {
      globalMatches.push(...searchGlobalDrug(analysis.drugName, globalDb, 3));
    }
    const seenGlobal = new Set<string>();
    globalMatches = globalMatches.filter((d) => {
      const key = d.itemName + d.genericName;
      if (seenGlobal.has(key)) return false;
      seenGlobal.add(key);
      return true;
    });

    return NextResponse.json({
      analysis,
      matchedDrugs: matchedDrugs.slice(0, 3),
      globalMatches: globalMatches.slice(0, 3),
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
