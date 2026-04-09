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
  rawText: string;
}

const SYSTEM_PROMPT = `You are a pharmaceutical expert specializing in pill identification. Analyze the pill image and respond in JSON format only.

Return this exact JSON structure:
{
  "drugName": "most likely drug/brand name",
  "shape": "shape description (round/oval/capsule/etc)",
  "color": "color description",
  "imprint": "text/numbers printed on the pill",
  "manufacturer": "manufacturer if identifiable",
  "description": "brief 1-2 sentence description",
  "confidence": 0-100,
  "searchTerms": ["term1", "term2", "term3"],
  "isKorean": true/false
}

Rules:
- searchTerms should include the drug name in both English and Korean if applicable
- If uncertain, lower the confidence score
- Focus on identifying the medication, not medical advice
- imprint should be the exact text visible on the pill surface`;

export async function analyzePillImage(
  imageData: string,
  mimeType: string
): Promise<PillAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    SYSTEM_PROMPT,
    {
      inlineData: {
        data: imageData,
        mimeType,
      },
    },
  ]);

  const text = result.response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid response from Gemini API");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    rawText: text,
    confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
    searchTerms: parsed.searchTerms || [parsed.drugName],
    isKorean: parsed.isKorean ?? false,
  };
}
