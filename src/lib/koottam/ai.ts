// Koottam Cart — AI orchestration helpers (server-only).
// Powered by Groq AI API (Ultra-fast LLM inference) & ZAI Web Dev SDK.
// All AI outputs are clearly labelled Actual / Estimated / Predicted / Demo.

import ZAI from "z-ai-web-dev-sdk";

let _zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZAI() {
  if (!_zai) _zai = await ZAI.create();
  return _zai;
}

export interface ChatMsg {
  role: "assistant" | "user";
  content: string;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Primary LLM completion function using Groq AI (Ultra-fast 120B/Compound)
 * with graceful fallback to ZAI SDK.
 */
export async function llmComplete(
  system: string,
  user: string,
  opts?: { thinking?: boolean; model?: string }
): Promise<string> {
  // 1. Try Groq AI API first if key is present
  if (GROQ_API_KEY) {
    try {
      const selectedModel = opts?.model || "openai/gpt-oss-120b";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let content = data.choices?.[0]?.message?.content ?? "";
        // Clean any reasoning blocks if present
        content = content.replace(/<Think>[\s\S]*?<\/Think>/gi, "").trim();
        if (content) return content;
      } else {
        console.warn(`Groq API response error ${res.status}, falling back to ZAI SDK`);
      }
    } catch (err: any) {
      console.warn("Groq API call failed, falling back to ZAI SDK:", err?.message);
    }
  }

  // 2. Fallback to ZAI SDK
  try {
    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: system },
        { role: "user", content: user },
      ],
      thinking: { type: opts?.thinking ? "enabled" : "disabled" },
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch (err: any) {
    console.error("ZAI SDK completion failed:", err);
    throw new Error("AI Completion unavailable: " + (err?.message || "Internal error"));
  }
}

/** Try to coerce an LLM response into a JSON object. */
export async function llmJson<T = unknown>(
  system: string,
  user: string
): Promise<T> {
  const raw = await llmComplete(
    system + "\n\nRespond with valid JSON only. No markdown fences, no extra text.",
    user
  );
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to extract the first JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* fall through */
      }
    }
    throw new Error("AI did not return valid JSON: " + raw.slice(0, 200));
  }
}

/** Tamil-capable voice assistant: turns a question + context into a spoken reply. */
export async function voiceAssistantReply(
  question: string,
  context: string
): Promise<string> {
  const system = `You are "Koottam Cart Voice AI", a bilingual (Tamil + English) assistant for a community vegetable market in Tamil Nadu, India.
Rules:
- If the user speaks Tamil, reply in Tamil (with English numerals in brackets where helpful).
- If the user speaks English, reply in English.
- Be concise (2-4 short sentences). Sound warm and helpful.
- Use the provided operational context to ground your answer. If data is missing, say so honestly.
- Never invent prices, quantities, or weather beyond the context.
- Always distinguish actual data from estimates/predictions.`;
  return llmComplete(system, `Operational context:\n${context}\n\nUser said: ${question}`);
}

/** Transcribe a base64-encoded audio clip to text (Tamil/English supported). */
export async function transcribeAudio(base64Audio: string): Promise<string> {
  try {
    const zai = await getZAI();
    const response = await zai.audio.asr.create({ file_base64: base64Audio });
    return response.text ?? "";
  } catch {
    return "";
  }
}

/** Generate speech audio (WAV buffer) from text. Tamil script supported. */
export async function synthesizeSpeech(
  text: string,
  opts?: { voice?: string; speed?: number }
): Promise<Buffer> {
  const zai = await getZAI();
  const response = await zai.audio.tts.create({
    input: text.slice(0, 1000),
    voice: opts?.voice ?? "tongtong",
    speed: opts?.speed ?? 1.0,
    response_format: "wav",
    stream: false,
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(new Uint8Array(arrayBuffer));
}

/** Truncate to a safe length for TTS (1024 char API limit). */
export function safeTtsChunk(text: string): string {
  return text.slice(0, 1000);
}
