import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface PillAnalysis {
  drugName: string;
  shape: string;
  color: string;
  imprint: string;
  imprintUnclear: boolean;
  manufacturer?: string;
  description: string;
  confidence: number;
  searchTerms: string[];
  isKorean: boolean;
  count: number; // how many of this type
}

const SYSTEM_PROMPT = `You are a pharmaceutical expert specializing in pill identification. Analyze the image carefully.

Tasks:
1. Identify ALL distinct pill types visible
2. Count the exact number of each type
3. Read imprints as carefully as possible (zoom into text on pill surface)

Respond in JSON format only — an array:

[
  {
    "drugName": "most likely drug/brand name (or 'Unknown')",
    "shape": "one of: 원형/타원형/장방형/삼각형/사각형/마름모형/오각형/육각형/팔각형/반원형/캡슐/기타",
    "color": "one of: 하양/노랑/주황/분홍/빨강/갈색/연두/초록/청록/파랑/남색/자주/보라/회색/검정/투명. If two colors: '하양/파랑'",
    "imprint": "exact alphanumeric text/numbers on the pill. Try VERY hard to read it. Empty string if truly none.",
    "imprintUnclear": false,
    "manufacturer": "manufacturer if identifiable, else null",
    "description": "one sentence physical description",
    "confidence": 0-100,
    "count": 1,
    "searchTerms": ["drug name in English", "drug name in Korean if applicable"],
    "isKorean": true
  }
]

Critical rules:
- shape MUST be one of the listed Korean categories
- color MUST use the listed Korean color names
- count: exact number of pills of this type visible in the image
- imprint: look VERY carefully at the pill surface. Even partial text helps identification.
- Set imprintUnclear=true ONLY if you see text exists but can't read it
- Different types = separate entries. Same type = one entry with count > 1
- Lower confidence if image quality is poor or pills are inside packaging`;

const COUNT_PROMPT = `Count all pills/tablets/capsules visible in this image.
Return JSON only: {"totalCount": number, "breakdown": [{"description": "brief description", "count": number}]}
Be precise. Count each individual pill, not types.`;

// Models to try in order (fallback chain)
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
];

export async function analyzePillImage(
  imageData: string,
  mimeType: string
): Promise<PillAnalysis[]> {
  const content = [
    SYSTEM_PROMPT,
    { inlineData: { data: imageData, mimeType } },
  ];

  for (let i = 0; i < MODELS.length; i++) {
    const modelName = MODELS[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(content);
      return parseGeminiResponse(result.response.text());
    } catch (e: any) {
      const msg = e.message || "";
      const isRateLimit = msg.includes("429") || msg.includes("quota") || msg.includes("Too Many");
      const isNotFound = msg.includes("404") || msg.includes("not found");

      if ((isRateLimit || isNotFound) && i < MODELS.length - 1) {
        console.log(`Model ${modelName} failed, trying ${MODELS[i + 1]}...`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      if (isRateLimit) {
        throw new Error("서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.");
      }
      throw e;
    }
  }
  throw new Error("All models unavailable");
}

export async function countPills(
  imageData: string,
  mimeType: string
): Promise<{ totalCount: number; breakdown: { description: string; count: number }[] }> {
  const content = [
    COUNT_PROMPT,
    { inlineData: { data: imageData, mimeType } },
  ];

  for (let i = 0; i < MODELS.length; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: MODELS[i] });
      const result = await model.generateContent(content);
      const text = result.response.text();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (e: any) {
      if (i < MODELS.length - 1) { await new Promise((r) => setTimeout(r, 1000)); continue; }
      throw e;
    }
  }
  return { totalCount: 0, breakdown: [] };
}

function parseGeminiResponse(text: string): PillAnalysis[] {
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (!objMatch) throw new Error("AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.");
    return [normalizePill(JSON.parse(objMatch[0]))];
  }

  const parsed = JSON.parse(arrayMatch[0]);
  const pills: PillAnalysis[] = Array.isArray(parsed)
    ? parsed.map(normalizePill)
    : [normalizePill(parsed)];

  return pills.length > 0 ? pills : [{
    drugName: "Unknown", shape: "", color: "", imprint: "",
    imprintUnclear: false, description: "Could not identify",
    confidence: 0, searchTerms: [], isKorean: false, count: 1,
  }];
}

function normalizePill(p: any): PillAnalysis {
  return {
    drugName:       p.drugName || "Unknown",
    shape:          p.shape || "",
    color:          p.color || "",
    imprint:        p.imprint || "",
    imprintUnclear: p.imprintUnclear ?? false,
    manufacturer:   p.manufacturer ?? undefined,
    description:    p.description || "",
    confidence:     Math.min(100, Math.max(0, p.confidence || 50)),
    searchTerms:    p.searchTerms || [p.drugName].filter(Boolean),
    isKorean:       p.isKorean ?? false,
    count:          Math.max(1, p.count || 1),
  };
}
