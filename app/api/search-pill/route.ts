import { NextRequest, NextResponse } from "next/server";
import {
  loadPillIdDatabase,
  loadDrugDatabase,
  enrichPillIdResults,
  type PillIdRecord,
} from "@/lib/drugDatabase";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const imprint = (params.get("imprint") || "").trim();
  const shape = (params.get("shape") || "").trim();
  const color = (params.get("color") || "").trim();
  const form = (params.get("form") || "").trim();

  if (!imprint && !shape && !color) {
    return NextResponse.json({ error: "하나 이상의 검색 조건을 입력해주세요." }, { status: 400 });
  }

  const db = loadPillIdDatabase();
  const detailDb = loadDrugDatabase();

  const scored = db.map((r) => {
    let score = 0;

    // Shape match
    if (shape && r.shape === shape) score += 30;
    else if (shape && r.shape !== shape) return { record: r, score: -1 };

    // Color match
    if (color) {
      if (r.color1 === color || r.color2 === color) score += 25;
      else return { record: r, score: -1 };
    }

    // Form match
    if (form) {
      const chart = (r.chart || "").toLowerCase();
      const name = (r.itemName || "").toLowerCase();
      if (form === "정제" && (chart.includes("정") || name.includes("정"))) score += 10;
      else if (form === "경질캡슐" && (chart.includes("경질캡슐") || name.includes("캡슐"))) score += 10;
      else if (form === "연질캡슐" && (chart.includes("연질캡슐") || name.includes("연질"))) score += 10;
      else if (form) return { record: r, score: -1 };
    }

    // Imprint match (highest priority)
    if (imprint) {
      const q = imprint.toLowerCase();
      const front = (r.markFront || "").toLowerCase();
      const back = (r.markBack || "").toLowerCase();
      if (front === q || back === q) score += 50;
      else if (front.includes(q) || back.includes(q)) score += 30;
      else if (q.split(/\s+/).some((t) => t && (front.includes(t) || back.includes(t)))) score += 15;
      else score -= 5;
    }

    return { record: r, score };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((s) => s.record);

  const enriched = enrichPillIdResults(matches, detailDb);

  return NextResponse.json({ results: enriched, total: enriched.length });
}
