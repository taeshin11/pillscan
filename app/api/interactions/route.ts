import { NextRequest, NextResponse } from "next/server";
import { checkInteractions } from "@/lib/drugInteractions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const drugNames: string[] = body.drugNames || [];
    if (!Array.isArray(drugNames) || drugNames.length < 2) {
      return NextResponse.json({ interactions: [], total: 0 });
    }
    const interactions = await checkInteractions(drugNames);
    return NextResponse.json({ interactions, total: interactions.length });
  } catch (e: any) {
    return NextResponse.json({ interactions: [], error: e.message }, { status: 500 });
  }
}
