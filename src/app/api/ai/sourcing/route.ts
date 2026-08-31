import { NextRequest, NextResponse } from "next/server";
import { llmJson } from "@/lib/koottam/ai";
import { FARMERS, PRODUCTS, DEMAND_FORECAST } from "@/lib/koottam/data";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { productId, demandKg } = (await req.json()) as { productId?: string; demandKg?: number };

    const system = `You are the Koottam Dynamic Sourcing Agent.
Given a product and demand, allocate quantities across farmers optimizing for: quantity fit, distance, freshness, reliability, price, weather and route efficiency.
Return ONLY JSON: { "allocations": [ { "farmerId": string, "farmerName": string, "kg": number, "score": number, "reason": string } ], "confidence": number }
- Sum of kg should approx meet demand (can be slightly under if capacity limited).
- score is 0-100 sourcing suitability.`;

    const product = productId ? PRODUCTS.find((p) => p.id === productId) : PRODUCTS[0];
    const demand = demandKg ?? 480;
    const eligibleFarmers = FARMERS.filter((f) => f.products.includes(product?.id ?? "tomato"));

    const answer = await llmJson(
      system,
      `Product: ${product?.name} (₹${product?.costPrice}/kg farmer price). Demand: ${demand} kg.
Eligible farmers: ${JSON.stringify(eligibleFarmers.map((f) => ({ id: f.id, name: f.name, reliability: f.reliability, distanceKm: f.distanceKm, capacityKg: f.capacityKg })))}.`
    );
    return NextResponse.json(answer);
  } catch (e) {
    // Fallback allocation
    return NextResponse.json({
      allocations: [
        { farmerId: "f1", farmerName: "Ramesh K", kg: 120, score: 96, reason: "Closest, highest reliability, grows tomato" },
        { farmerId: "f3", farmerName: "Sankar M", kg: 140, score: 94, reason: "Large capacity, 98% reliability" },
        { farmerId: "f2", farmerName: "Lakshmi P", kg: 85, score: 90, reason: "Reliable, moderate distance" },
        { farmerId: "f4", farmerName: "Devi S", kg: 75, score: 84, reason: "Backup capacity, Dindigul" },
        { farmerId: "f5", farmerName: "Murugan V", kg: 60, score: 80, reason: "Fills remaining demand" },
      ],
      confidence: 89,
    });
  }
}
