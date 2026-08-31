import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, voiceAssistantReply, synthesizeSpeech } from "@/lib/koottam/ai";
import { DEMAND_FORECAST, WEATHER, CONTROL_TOWER, PRODUCTS } from "@/lib/koottam/data";

export const runtime = "nodejs";
export const maxDuration = 60;

function buildContext(): string {
  const w = WEATHER.madurai;
  return `Madurai weather: ${w.condition}, ${w.temp}°C, rain prob ${w.rainProb}%, ${w.rainfall}mm rainfall, humidity ${w.humidity}%.
Tomorrow demand forecast: ${DEMAND_FORECAST.map((d) => {
    const p = PRODUCTS.find((x) => x.id === d.productId);
    return `${p?.name} ${d.predictedKg}${p?.unit} (${d.changePct >= 0 ? "+" : ""}${d.changePct}% vs confirmed ${d.confirmedKg})`;
}).join(", ")}.
Control tower: demand ${CONTROL_TOWER.demandKg} kg, supply ${CONTROL_TOWER.supplyKg} kg, revenue forecast ₹${CONTROL_TOWER.revenueForecastInr}.`;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let question = "";
    let speak = true;
    let base64 = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      question = body.text ?? "";
      speak = body.speak ?? true;
      base64 = body.audio ?? "";
    } else {
      const buf = Buffer.from(await req.arrayBuffer());
      base64 = buf.toString("base64");
    }

    if (!question && base64) {
      question = await transcribeAudio(base64);
    }
    if (!question) {
      return NextResponse.json({ error: "Provide text or audio" }, { status: 400 });
    }

    const reply = await voiceAssistantReply(question, buildContext());

    let audioBase64 = "";
    if (speak) {
      try {
        const wav = await synthesizeSpeech(reply.slice(0, 1000));
        audioBase64 = `data:audio/wav;base64,${wav.toString("base64")}`;
      } catch {
        /* TTS optional */
      }
    }

    return NextResponse.json({ transcription: question, reply, audio: audioBase64 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "voice error" }, { status: 500 });
  }
}
