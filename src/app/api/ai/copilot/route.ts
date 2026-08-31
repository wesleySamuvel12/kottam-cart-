import { NextRequest, NextResponse } from "next/server";
import { llmComplete } from "@/lib/koottam/ai";
import { CONTROL_TOWER, GMV_TREND, HUB_PNL, PILOT, PRODUCTS, FARMERS, CUSTOMERS, GROUPS, IMPACT } from "@/lib/koottam/data";

export const runtime = "nodejs";

function platformContext(): string {
  const gmvTotal = GMV_TREND.reduce((a, b) => a + b.gmv, 0);
  const ordersTotal = GMV_TREND.reduce((a, b) => a + b.orders, 0);
  const activeCustomers = CUSTOMERS.filter((c) => c.status === "Active").length;
  const atRisk = CUSTOMERS.filter((c) => c.status === "At Risk").length;
  return `KOOTTAM CART — LIVE PLATFORM CONTEXT (clearly distinguish Actual / Estimated / Predicted / Demo)

Control Tower:
- Demand: ${CONTROL_TOWER.demandKg.toLocaleString("en-IN")} kg
- Supply: ${CONTROL_TOWER.supplyKg.toLocaleString("en-IN")} kg
- Forecast accuracy: ${CONTROL_TOWER.forecastAccuracy}%
- Waste risk: ${CONTROL_TOWER.wasteRisk}, Weather risk: ${CONTROL_TOWER.weatherRisk}, Logistics risk: ${CONTROL_TOWER.logisticsRisk}
- Revenue forecast: ₹${CONTROL_TOWER.revenueForecastInr.toLocaleString("en-IN")} (₹${CONTROL_TOWER.revenueForecastLakh} lakh)

7-day GMV (Actual): total ₹${gmvTotal.toLocaleString("en-IN")} across ${ordersTotal.toLocaleString("en-IN")} orders. Daily: ${GMV_TREND.map((d) => `${d.day}=₹${d.gmv.toLocaleString("en-IN")}/${d.orders} orders`).join(", ")}.

Hubs: ${HUB_PNL.map((h) => `${h.hubId}: revenue ₹${h.revenueForecastInr.toLocaleString("en-IN")}, cost ₹${h.operatingCostForecastInr.toLocaleString("en-IN")}, profit ₹${h.profitForecastInr.toLocaleString("en-IN")}, cost/order ₹${h.costPerOrder}`).join(" | ")}.

Pilot (Madurai): ${PILOT.farmers} farmers, ${PILOT.shgLeaders} SHG leaders, ${PILOT.households} households, ${PILOT.durationMonths} months. Health: ${PILOT.health}. Targets vs actuals — savings ${PILOT.targets.customerSavingsPct}%→${PILOT.actuals.customerSavingsPct}%, farmer income +${PILOT.targets.farmerIncomeImprovePct}%→+${PILOT.actuals.farmerIncomeImprovePct}%, repeat rate ${PILOT.targets.repeatOrderRatePct}%→${PILOT.actuals.repeatOrderRatePct}%.

Customers: ${CUSTOMERS.length} shown (${activeCustomers} active, ${atRisk} at risk). Groups: ${GROUPS.length}.

Products (15): top movers tomato (₹42/kg sell, ₹28 cost), onion (₹38/₹26), coriander (trend +18%), drumstick (trend +7%).

Impact: customer savings ₹${IMPACT.customerSavingsInr.toLocaleString("en-IN")}, farmer income ₹${IMPACT.farmerIncomeInr.toLocaleString("en-IN")}, waste avoided ${IMPACT.wasteAvoidedKg} kg, ${IMPACT.householdsServed} households served.

Farmers: ${FARMERS.length} active (Ramesh K, Lakshmi P, Sankar M, Devi S, Murugan V, Kavitha R, Pandian T, Geetha N) across Madurai & Dindigul.`;
}

export async function POST(req: NextRequest) {
  try {
    const { question, history } = (await req.json()) as {
      question: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };
    if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });

    const system = `You are "Koottam AI", the Business Copilot for Koottam Cart — an AI-native community commerce and agri-supply-chain platform in Tamil Nadu, India.
You coordinate weather → demand → farming → supply → pricing → logistics → customers → payments → business intelligence.

ABSOLUTE RULES:
1. Ground every answer in the provided platform context. Use ONLY those numbers.
2. ALWAYS clearly label data as Actual / Estimated / Predicted / Demo. Never present predictions as guaranteed facts.
3. Structure answers with: direct answer → supporting metrics → recommendation → assumptions.
4. Use Markdown with short tables or bullet lists where helpful. Be concise but complete.
5. Distinguish operational facts from forecasts and from assumptions.
6. Never claim external market prices exist when only internal platform data is available.
7. Sensitive actions (money transfer, payout changes, large cancellations) always require explicit human confirmation.`;

    const messages = (history ?? []).slice(-8);
    const historyBlock =
      messages.length > 0
        ? "\n\nConversation so far:\n" + messages.map((m) => `${m.role}: ${m.content}`).join("\n")
        : "";

    const answer = await llmComplete(
      system,
      `${platformContext()}${historyBlock}\n\nAdmin question: ${question}`
    );

    return NextResponse.json({ answer, label: "Mixed" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
