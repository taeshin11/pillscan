/**
 * Client for the local Python inference server.
 * Calls CLIP visual search and YOLO imprint OCR.
 */

const SERVER_URL = process.env.INFERENCE_SERVER_URL || "";
const TIMEOUT_MS = 15000;

export interface VisualMatch {
  itemSeq: string;
  itemName: string;
  entpName: string;
  shape: string;
  color1: string;
  color2: string;
  markFront: string;
  markBack: string;
  itemImage: string;
  className?: string;
  similarity: number;
}

export interface InferenceResult {
  imprint: string;
  imprint_detections?: Array<{ label: string; confidence: number; bbox: number[] }>;
  visual_matches: VisualMatch[];
}

export async function callInferenceServer(imageBase64: string, mimeType: string): Promise<InferenceResult | null> {
  if (!SERVER_URL) return null;

  try {
    // Convert base64 to Blob → FormData
    const buffer = Buffer.from(imageBase64, "base64");
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append("file", blob, "pill.jpg");

    const res = await fetch(`${SERVER_URL}/identify`, {
      method: "POST",
      body: formData,
      headers: { "ngrok-skip-browser-warning": "1" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`Inference server returned ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (e: any) {
    console.warn("Inference server unreachable:", e.message);
    return null;
  }
}

export async function enhanceImage(imageBase64: string, mimeType: string): Promise<{ data: string; mimeType: string } | null> {
  if (!SERVER_URL) return null;
  try {
    const buffer = Buffer.from(imageBase64, "base64");
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append("file", blob, "pill.jpg");

    const res = await fetch(`${SERVER_URL}/enhance`, {
      method: "POST",
      body: formData,
      headers: { "ngrok-skip-browser-warning": "1" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { data: data.image, mimeType: data.mimeType || "image/jpeg" };
  } catch {
    return null;
  }
}

export async function inferenceServerHealth(): Promise<boolean> {
  if (!SERVER_URL) return false;
  try {
    const res = await fetch(`${SERVER_URL}/health`, {
      headers: { "ngrok-skip-browser-warning": "1" },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
