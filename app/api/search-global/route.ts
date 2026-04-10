import { NextRequest, NextResponse } from "next/server";
import { loadGlobalDatabase, searchGlobalDrug } from "@/lib/drugDatabase";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const db = loadGlobalDatabase();
  const results = searchGlobalDrug(q, db, 20);

  return NextResponse.json({ results, total: results.length });
}
