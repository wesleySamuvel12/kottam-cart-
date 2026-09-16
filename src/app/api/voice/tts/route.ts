import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/koottam/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed } = (await req.json()) as {
      text: string;
      voice?: string;
      speed?: number;
    };
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

    const buffer = await synthesizeSpeech(text, { voice, speed });
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "TTS error" }, { status: 500 });
  }
}
