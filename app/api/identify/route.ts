import { NextRequest, NextResponse } from "next/server";
import { analyzePillImage } from "@/lib/gemini";
import { loadDrugDatabase, searchDrug, type DrugRecord } from "@/lib/drugDatabase";

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

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Analyze with Gemini
    const analysis = await analyzePillImage(base64, file.type);

    // Search Korean drug database
    const db = loadDrugDatabase();
    let matchedDrugs: DrugRecord[] = [];

    for (const term of analysis.searchTerms) {
      const results = searchDrug(term, db, 3);
      matchedDrugs.push(...results);
    }

    // Deduplicate by itemSeq
    const seen = new Set<string>();
    matchedDrugs = matchedDrugs.filter((d) => {
      if (seen.has(d.itemSeq)) return false;
      seen.add(d.itemSeq);
      return true;
    });

    // Also search by drug name directly
    if (analysis.drugName && matchedDrugs.length === 0) {
      const directSearch = searchDrug(analysis.drugName, db, 3);
      matchedDrugs.push(...directSearch);
    }

    return NextResponse.json({
      analysis,
      matchedDrugs: matchedDrugs.slice(0, 3),
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

