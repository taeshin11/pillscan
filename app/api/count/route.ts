import { NextRequest, NextResponse } from "next/server";
import { countPills } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) return NextResponse.json({ error: "No image" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Too large" }, { status: 400 });

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await countPills(base64, file.type);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Count failed" }, { status: 500 });
  }
}
