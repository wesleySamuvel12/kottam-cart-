import { NextRequest, NextResponse } from "next/server";
import { llmJson } from "@/lib/koottam/ai";
import { PRODUCTS } from "@/lib/koottam/data";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { available, preferences } = (await req.json()) as {
      available: string[];
      preferences?: string;
    };
    const pantry = available.length > 0 ? available : ["Tomato", "Onion", "Brinjal", "Spinach"];
    const system = `You are a Tamil-cuisine meal planner for Koottam Cart customers.
Suggest 3 meal ideas using mostly the available vegetables. Prefer Tamil/South-Indian recipes.
Return ONLY a JSON object: { "meals": [ { "name": string, "ta": string, "uses": string[], "missing": string[], "time": string } ] }
- "uses": vegetables from the available list
- "missing": extra vegetables/spices needed (may be empty)
- "ta": Tamil name of the dish`;

    const answer = await llmJson(
      system,
      `Available vegetables in basket: ${pantry.join(", ")}.
Customer preferences: ${preferences ?? "none"}.
Suggest 3 meals.`
    );
    return NextResponse.json(answer);
  } catch (e) {
    // Fallback static meal ideas so the UI always works
    const fallback = {
      meals: [
        { name: "Brinjal Tomato Curry", ta: "கத்தரிக்காய் தக்காளி கூட்டு", uses: ["Brinjal", "Tomato", "Onion"], missing: ["Mustard", "Curry Leaves"], time: "25 min" },
        { name: "Spinach Dal", ta: "கீரை பருப்பு", uses: ["Spinach", "Onion", "Tomato"], missing: ["Toor Dal", "Turmeric"], time: "30 min" },
        { name: "Mixed Veg Kootu", ta: "காய்கறி கூட்டு", uses: ["Brinjal", "Tomato", "Onion", "Spinach"], missing: ["Coconut"], time: "35 min" },
      ],
    };
    return NextResponse.json(fallback);
  }
}
