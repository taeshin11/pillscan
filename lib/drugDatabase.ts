import { readFileSync } from "fs";
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

let _cache: DrugRecord[] | null = null;

function parseCSV(content: string): DrugRecord[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].replace(/^\uFEFF/, "").split(",");
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h.trim()] = (values[i] || "").trim();
    });
    return { ...(record as unknown as DrugRecord), source: "korean" };
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function loadDrugDatabase(): DrugRecord[] {
  if (_cache) return _cache;
  try {
    const csvPath = path.join(process.cwd(), "..", "druginfo", "의약품_개요정보.csv");
    const content = readFileSync(csvPath, "utf-8");
    _cache = parseCSV(content);
    return _cache;
  } catch {
    console.warn("Drug database CSV not found, using empty DB");
    _cache = [];
    return _cache;
  }
}

export function searchDrug(
  query: string,
  drugs: DrugRecord[],
  topN = 3
): DrugRecord[] {
  if (!query || !drugs.length) return [];
  const q = query.toLowerCase().replace(/\s+/g, "");

  const scored = drugs.map((d) => {
    const name = (d.itemName || "").toLowerCase().replace(/\s+/g, "");
    const company = (d.entpName || "").toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.includes(q)) score = 60;
    else if (q.split("").every((c) => name.includes(c))) score = 30;
    if (company.includes(q)) score += 10;
    return { drug: d, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.drug);
}
