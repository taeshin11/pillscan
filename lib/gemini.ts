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
}

const SYSTEM_PROMPT = `You are a pharmaceutical expert specializing in pill identification. Analyze the image and identify ALL distinct pill types visible.

Respond in JSON format only — an array:

[
  {
    "drugName": "most likely drug/brand name (or 'Unknown')",
    "shape": "one of: 원형/타원형/장방형/삼각형/사각형/마름모형/오각형/육각형/팔각형/반원형/캡슐/기타",
    "color": "one of: 하양/노랑/주황/분홍/빨강/갈색/연두/초록/청록/파랑/남색/보라/회색/검정/투명. If two colors use format '하양/파랑'",
    "imprint": "exact alphanumeric text/numbers imprinted or printed on the pill. Empty string if none visible.",
    "imprintUnclear": false,
    "manufacturer": "manufacturer if identifiable, else null",
    "description": "one sentence physical description",
    "confidence": 0-100,
    "searchTerms": ["drug name in English", "drug name in Korean if applicable"],
    "isKorean": true
  }
]

Critical rules:
- shape MUST be one of the listed Korean categories
- color MUST use the listed Korean color names
- imprint: read the actual text stamped/printed on the pill surface very carefully
- Set imprintUnclear=true if you can see there IS text but can't read it clearly
- If multiple pills of the SAME type, list once. Different types = separate entries.
- Lower confidence if image quality is poor`;

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

      // If rate limited or model not found, try next model
      if ((isRateLimit || isNotFound) && i < MODELS.length - 1) {
        console.log(`Model ${modelName} failed (${isRateLimit ? "rate limit" : "not found"}), trying ${MODELS[i + 1]}...`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      // Last model also failed
      if (isRateLimit) {
        throw new Error("서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.");
      }
      throw e;
    }
  }

  throw new Error("All models unavailable");
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
    confidence: 0, searchTerms: [], isKorean: false,
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
  };
}
