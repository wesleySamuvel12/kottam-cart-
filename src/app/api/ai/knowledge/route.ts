import { NextRequest, NextResponse } from "next/server";
import { llmComplete } from "@/lib/koottam/ai";

export const runtime = "nodejs";

const KOOTTAM_DOCS = `
KOOTTAM CART — OFFICIAL DOCUMENTATION (retrieval source for the Knowledge Center)

1. Group buying: Households join a neighbourhood "group" led by an SHG (Self-Help Group) leader. Orders are pooled daily. Bulk procurement lowers cost; savings are shared with customers and farmers.

2. Farmer payment: Farmers are paid the "farmer realization" price per kg, settled weekly after the group order closes. Payment = (confirmed kg supplied × farmer price) − any quality deductions (transparently shown). Settlement is never changed by AI automatically; human approval required.

3. Pickup: Each group has an AI-optimized pickup window (typically evening, 5–8 PM). Members collect their pre-packed baskets from the group leader's pickup point. Windows adapt to weather and member availability.

4. Data usage: Koottam uses order, weather, and operational data to forecast demand, optimize supply and logistics, and prevent waste. We never use sensitive personal characteristics for churn or fraud models. AI outputs are recommendations, not automated decisions affecting payouts.

5. Demand forecast: Generated from historical orders + weekday + weather + seasonality + festival calendar + group behaviour. Each forecast shows prediction, confidence, reason, and recommended action. Predictions and outcomes are logged to measure accuracy over time.

6. AI safety: AI never independently transfers money, changes settlements, deletes users, or alters farmer payouts without explicit human authorization. Every important output supports Why? / Data used / Confidence / Recommendation / Human override.

7. Pilot scope: Madurai pilot — 15 farmers, 20 SHG leaders, 300 households, 2-month pilot. Targets: 20% customer savings, 25% farmer income improvement, 70%+ repeat order rate.
`;

export async function POST(req: NextRequest) {
  try {
    const { question } = (await req.json()) as { question: string };
    if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });

    const system = `You are the Koottam Cart Knowledge Center assistant.
Answer ONLY from the official documentation provided. If the answer is not in the docs, say: "I don't have that in the official Koottam documentation. Please contact support."
Never hallucinate policies. Be clear and concise (3-6 sentences). Use bullet points when listing steps.`;

    const answer = await llmComplete(system, `${KOOTTAM_DOCS}\n\nQuestion: ${question}`);
    return NextResponse.json({ answer });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 500 });
  }
}
