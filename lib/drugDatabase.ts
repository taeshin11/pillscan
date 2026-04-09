import { readFileSync, existsSync } from "fs";
import path from "path";

export interface DrugRecord {
  entpName: string;
  itemName: string;
  itemSeq: string;
  efcyQesitm: string;
  useMethodQesitm: string;
  atpnWarnQesitm: string;
  atpnQesitm: string;
  intrcQesitm: string;
  seQesitm: string;
  depositMethodQesitm: string;
  openDe: string;
  updateDe: string;
  itemImage: string;
  bizrno: string;
  source: "korean" | "global";
}

export interface PillIdRecord {
  itemSeq: string;
  itemName: string;
  entpName: string;
  shape: string;    // 원형, 타원형, 장방형, 삼각형, 사각형, 마름모형, 오각형, 육각형, 팔각형, 반원형, 기타
  color1: string;
  color2: string;
  markFront: string; // 앞면 각인/인쇄
  markBack: string;  // 뒷면 각인/인쇄
  chart: string;
  itemImage: string;
  etcOtc: string;
  className: string;
}

export interface GlobalDrugRecord {
  source: string;
  itemName: string;
  genericName: string;
  manufacturer: string;
  ndc: string[];
  route: string;
  dosageForm: string;
  indications: string;
  warnings: string;
  dosage: string;
  sideEffects: string;
  interactions: string;
  storage: string;
}

let _koreanCache: DrugRecord[] | null = null;
let _pillIdCache: PillIdRecord[] | null = null;
let _globalCache: GlobalDrugRecord[] | null = null;

// ── CSV parser ──────────────────────────────────────────────────
function parseCSV(content: string): DrugRecord[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].replace(/^\uFEFF/, "").split(",");
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => { record[h.trim()] = (values[i] || "").trim(); });
    return { ...(record as unknown as DrugRecord), source: "korean" };
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

// ── Loaders ─────────────────────────────────────────────────────
export function loadDrugDatabase(): DrugRecord[] {
  if (_koreanCache) return _koreanCache;
  try {
    const content = readFileSync(path.join(process.cwd(), "data", "korean_drugs.csv"), "utf-8");
    _koreanCache = parseCSV(content);
  } catch { _koreanCache = []; }
  return _koreanCache;
}

export function loadPillIdDatabase(): PillIdRecord[] {
  if (_pillIdCache) return _pillIdCache;
  try {
    const p = path.join(process.cwd(), "data", "pill_identification.json");
    if (!existsSync(p)) { _pillIdCache = []; return _pillIdCache; }
    _pillIdCache = JSON.parse(readFileSync(p, "utf-8"));
  } catch { _pillIdCache = []; }
  return _pillIdCache!;
}

export function loadGlobalDatabase(): GlobalDrugRecord[] {
  if (_globalCache) return _globalCache;
  try {
    const p = path.join(process.cwd(), "data", "international_drugs.json");
    if (!existsSync(p)) { _globalCache = []; return _globalCache; }
    _globalCache = JSON.parse(readFileSync(p, "utf-8"));
  } catch { _globalCache = []; }
  return _globalCache!;
}

// ── Shape normalizer (Gemini English → Korean DB categories) ────
const SHAPE_MAP: Record<string, string[]> = {
  "원형":   ["round", "circular", "circle", "원형", "원"],
  "타원형": ["oval", "ellipse", "elliptical", "타원", "타원형"],
  "장방형": ["oblong", "rectangular", "rectangle", "장방", "캡슐형"],
  "삼각형": ["triangle", "triangular", "삼각"],
  "사각형": ["square", "quadrilateral", "사각", "정방형"],
  "마름모형":["diamond", "rhombus", "마름모"],
  "오각형": ["pentagon", "오각"],
  "육각형": ["hexagon", "hexagonal", "육각"],
  "팔각형": ["octagon", "octagonal", "팔각"],
  "반원형": ["semicircle", "half", "반원"],
  "캡슐":   ["capsule", "캡슐"],
};

export function normalizeShape(geminiShape: string): string {
  const s = geminiShape.toLowerCase().trim();
  for (const [korean, patterns] of Object.entries(SHAPE_MAP)) {
    if (patterns.some((p) => s.includes(p))) return korean;
  }
  return "";
}

const COLOR_MAP: Record<string, string[]> = {
  "하양": ["white", "cream", "ivory", "하양", "흰", "white/cream"],
  "노랑": ["yellow", "노랑", "노란", "gold"],
  "주황": ["orange", "주황"],
  "분홍": ["pink", "분홍", "rose", "light red"],
  "빨강": ["red", "scarlet", "crimson", "빨강"],
  "갈색": ["brown", "beige", "tan", "갈색", "베이지"],
  "연두": ["light green", "lime", "연두"],
  "초록": ["green", "dark green", "초록", "녹색"],
  "청록": ["teal", "cyan", "청록"],
  "파랑": ["blue", "파랑", "파란", "navy"],
  "남색": ["navy", "dark blue", "남색"],
  "보라": ["purple", "violet", "lavender", "보라"],
  "회색": ["gray", "grey", "silver", "회색"],
  "검정": ["black", "dark", "검정", "검은"],
  "투명": ["transparent", "clear", "투명"],
};

export function normalizeColor(geminiColor: string): string {
  const c = geminiColor.toLowerCase().trim();
  for (const [korean, patterns] of Object.entries(COLOR_MAP)) {
    if (patterns.some((p) => c.includes(p))) return korean;
  }
  return "";
}

// ── Pill identification search (shape + color + imprint) ─────────
export interface PillIdSearchParams {
  shape?: string;       // Gemini raw (English or Korean)
  color?: string;       // Gemini raw
  imprint?: string;     // text on pill
}

export function searchByAttributes(
  params: PillIdSearchParams,
  db: PillIdRecord[],
  topN = 5
): PillIdRecord[] {
  if (!db.length) return [];

  const targetShape = params.shape ? normalizeShape(params.shape) : "";
  const targetColor = params.color ? normalizeColor(params.color) : "";
  const targetImprint = (params.imprint || "").toLowerCase().trim();

  const scored = db.map((r) => {
    let score = 0;

    // Shape match (high weight — most distinctive)
    if (targetShape && r.shape) {
      if (r.shape === targetShape) score += 40;
    }

    // Color match
    if (targetColor && (r.color1 || r.color2)) {
      if (r.color1 === targetColor || r.color2 === targetColor) score += 30;
    }

    // Imprint match (highest weight when present)
    if (targetImprint) {
      const front = (r.markFront || "").toLowerCase();
      const back  = (r.markBack  || "").toLowerCase();
      if (front === targetImprint || back === targetImprint) {
        score += 60;  // exact match
      } else if (front.includes(targetImprint) || back.includes(targetImprint)) {
        score += 35;  // partial match
      } else if (targetImprint.split(/\W+/).some((t) => t && (front.includes(t) || back.includes(t)))) {
        score += 15;  // token match
      }
    }

    return { record: r, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.record);
}

// ── Name-based searches ──────────────────────────────────────────
export function searchDrug(query: string, drugs: DrugRecord[], topN = 3): DrugRecord[] {
  if (!query || !drugs.length) return [];
  const q = query.toLowerCase().replace(/\s+/g, "");
  const scored = drugs.map((d) => {
    const name = (d.itemName || "").toLowerCase().replace(/\s+/g, "");
    let score = 0;
    if (name === q) score = 100;
    else if (name.includes(q)) score = 60;
    else if (q.split("").every((c) => name.includes(c))) score = 30;
    return { drug: d, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, topN).map((s) => s.drug);
}

export function searchGlobalDrug(query: string, drugs: GlobalDrugRecord[], topN = 3): GlobalDrugRecord[] {
  if (!query || !drugs.length) return [];
  const q = query.toLowerCase().replace(/\s+/g, "");
  const scored = drugs.map((d) => {
    const name    = (d.itemName    || "").toLowerCase().replace(/\s+/g, "");
    const generic = (d.genericName || "").toLowerCase().replace(/\s+/g, "");
    let score = 0;
    if (name === q || generic === q) score = 100;
    else if (name.includes(q) || generic.includes(q)) score = 60;
    return { drug: d, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, topN).map((s) => s.drug);
}

// ── Merge pill ID results with detail DB ────────────────────────
export function enrichPillIdResults(
  pillIdResults: PillIdRecord[],
  detailDb: DrugRecord[]
): (PillIdRecord & { detail?: DrugRecord })[] {
  return pillIdResults.map((p) => {
    const detail = detailDb.find((d) => d.itemSeq === p.itemSeq);
    return { ...p, detail };
  });
}
