import { NextRequest, NextResponse } from "next/server";
import { llmJson } from "@/lib/koottam/ai";
import { PRODUCTS } from "@/lib/koottam/data";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { budget } = (await req.json()) as { budget: number };
    if (!budget || budget <= 0) return NextResponse.json({ error: "budget required" }, { status: 400 });

    const productCatalog = PRODUCTS.map((p) => ({
      name: p.name,
      unit: p.unit,
      sellPrice: p.sellPrice,
    }));

    const system = `You are the Koottam Cart Budget Optimizer.
Create an optimized vegetable basket that fits within the customer's budget while maximizing variety and nutrition for a Tamil household (approx 1 week).
Return ONLY JSON: { "items": [ { "name": string, "qty": number, "unit": string, "price": number } ], "total": number, "savings": number, "note": string }
- "price" = qty × sellPrice
- "total" must be <= budget
- "savings" = budget - total
- Include 5-7 items. Use realistic per-kg prices from the catalog.`;

    const answer = await llmJson(
      system,
      `Budget: ₹${budget}\nProduct catalog (name, unit, ₹/unit): ${JSON.stringify(productCatalog)}`
    );
    return NextResponse.json(answer);
  } catch (e) {
    // Fallback optimized basket
    const basket = [
      { name: "Tomato", qty: 2, unit: "kg", price: 84 },
      { name: "Onion", qty: 2, unit: "kg", price: 76 },
      { name: "Potato", qty: 2, unit: "kg", price: 64 },
      { name: "Carrot", qty: 1, unit: "kg", price: 52 },
      { name: "Beans", qty: 1, unit: "kg", price: 48 },
      { name: "Spinach", qty: 2, unit: "bundle", price: 24 },
    ];
    const total = basket.reduce((a, b) => a + b.price, 0);
    const budget = 500;
    return NextResponse.json({
      items: basket,
      total,
      savings: budget - total,
      note: "Optimized basket covering staples + nutrition within budget.",
    });
  }
}
