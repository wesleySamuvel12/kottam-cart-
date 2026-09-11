import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/koottam/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let base64 = "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      base64 = body.audio ?? "";
    } else {
      const buf = Buffer.from(await req.arrayBuffer());
      base64 = buf.toString("base64");
    }
    if (!base64) return NextResponse.json({ error: "audio required" }, { status: 400 });

    const text = await transcribeAudio(base64);
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "ASR error" }, { status: 500 });
  }
}
