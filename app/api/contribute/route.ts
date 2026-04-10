import { NextRequest, NextResponse } from "next/server";

const INFERENCE_URL = process.env.INFERENCE_SERVER_URL || "";
const SHEETS_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";

export async function POST(req: NextRequest) {
  try {
    // Two paths:
    // 1. multipart/form-data with image → forward to inference server (full contribution)
    // 2. JSON only (metadata only) → send to Sheets webhook
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Full image contribution
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });

      // Forward to local inference server for permanent storage
      if (INFERENCE_URL) {
        const fwd = new FormData();
        fwd.append("file", file);
        fwd.append("drug_name", String(formData.get("drugName") || ""));
        fwd.append("shape", String(formData.get("shape") || ""));
        fwd.append("color", String(formData.get("color") || ""));
        fwd.append("imprint", String(formData.get("imprint") || ""));
        fwd.append("confidence", String(formData.get("confidence") || 0));

        try {
          const res = await fetch(`${INFERENCE_URL}/contribute`, {
            method: "POST",
            body: fwd,
            headers: { "ngrok-skip-browser-warning": "1" },
            signal: AbortSignal.timeout(10000),
          });
          if (res.ok) {
            const data = await res.json();
            return NextResponse.json({ ok: true, id: data.id });
          }
        } catch (e) {
          console.warn("Inference contribute failed:", e);
        }
      }

      return NextResponse.json({ ok: true, stored: false });
    }

    // JSON metadata only
    const body = await req.json();
    if (SHEETS_URL) {
      await fetch(SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          drugName: body.drugName || "",
          shape: body.shape || "",
          color: body.color || "",
          imprint: body.imprint || "",
          confidence: body.confidence || 0,
          userConsented: true,
        }),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}
