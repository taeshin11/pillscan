import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ ok: true });
    }

    // Sanitize — only send analysis metadata, not the raw image
    const payload = {
      timestamp: new Date().toISOString(),
      drugName: body.drugName || "",
      shape: body.shape || "",
      color: body.color || "",
      imprint: body.imprint || "",
      confidence: body.confidence || 0,
      userConsented: true,
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
