// Koottam Cart — AI orchestration helpers (server-only).
// Uses z-ai-web-dev-sdk for LLM, ASR (speech-to-text) and TTS (text-to-speech).
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

/** Standard LLM completion. Returns plain text. */
export async function llmComplete(
  system: string,
  user: string,
  opts?: { thinking?: boolean }
): Promise<string> {
  const zai = await getZAI();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: "assistant", content: system },
      { role: "user", content: user },
    ],
    thinking: { type: opts?.thinking ? "enabled" : "disabled" },
  });
  return completion.choices[0]?.message?.content ?? "";
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
  const zai = await getZAI();
  const response = await zai.audio.asr.create({ file_base64: base64Audio });
  return response.text ?? "";
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
