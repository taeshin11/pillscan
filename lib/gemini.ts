import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface PillAnalysis {
  drugName: string;
  shape: string;
  color: string;
  imprint: string;
  manufacturer?: string;
  description: string;
  confidence: number;
  searchTerms: string[];
  isKorean: boolean;
}

const SYSTEM_PROMPT = `You are a pharmaceutical expert specializing in pill identification. Analyze the image and identify ALL distinct pill types visible.

Respond in JSON format only — an array of pills found:

[
  {
    "drugName": "most likely drug/brand name",
    "shape": "shape (round/oval/capsule/oblong/etc)",
    "color": "color description",
    "imprint": "exact text/numbers printed on the pill surface, empty string if none",
    "manufacturer": "manufacturer if identifiable",
    "description": "brief 1-sentence description",
    "confidence": 0-100,
    "searchTerms": ["name in English", "name in Korean if applicable"],
    "isKorean": true/false
  }
]

Rules:
- If multiple pills of the SAME type are present, list that type ONCE
- If different pill types are present, list each type separately
- Count distinct types, not individual pill count
- If only one type is visible, still return an array with one element
- Lower confidence if imprint or shape is unclear
- searchTerms must include the drug name; add Korean name if recognizable`;

export async function analyzePillImage(
  imageData: string,
  mimeType: string
): Promise<PillAnalysis[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    SYSTEM_PROMPT,
    { inlineData: { data: imageData, mimeType } },
  ]);

  const text = result.response.text();

  // Extract JSON array from response
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    // Fallback: try single object and wrap
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (!objMatch) throw new Error("Invalid response from Gemini API");
    const parsed = JSON.parse(objMatch[0]);
    return [normalizePill(parsed)];
  }

  const parsed = JSON.parse(arrayMatch[0]);
  const pills: PillAnalysis[] = Array.isArray(parsed)
    ? parsed.map(normalizePill)
    : [normalizePill(parsed)];

  return pills.length > 0 ? pills : [{ drugName: "Unknown", shape: "", color: "", imprint: "", description: "Could not identify", confidence: 0, searchTerms: [], isKorean: false }];
}

function normalizePill(p: any): PillAnalysis {
  return {
    drugName: p.drugName || "Unknown",
    shape: p.shape || "",
    color: p.color || "",
    imprint: p.imprint || "",
    manufacturer: p.manufacturer,
    description: p.description || "",
    confidence: Math.min(100, Math.max(0, p.confidence || 50)),
    searchTerms: p.searchTerms || [p.drugName].filter(Boolean),
    isKorean: p.isKorean ?? false,
  };
}
