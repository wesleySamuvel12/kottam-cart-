// KottamCart — AI Farmer Matching & Requirement Message Generation Engine.

import { db } from "../db";

export interface FarmerMatch {
  farmerId: string;
  farmerName: string;
  phone: string;
  whatsappNumber: string | null;
  village: string;
  crops: string[];
  reliability: number;
  rating: number;
  capacityKg: number;
  matchScore: number;
  reason: string;
}

/** Match best farmer from DB for a crop requirement */
export async function suggestBestFarmer(
  cropId: string,
  requiredKg: number,
  channel: "WHATSAPP" | "SMS"
): Promise<{ bestMatch: FarmerMatch | null; candidates: FarmerMatch[] }> {
  const farmers = await db.farmer.findMany({
    where: { status: "Active" },
  });

  const candidates: FarmerMatch[] = [];

  for (const f of farmers) {
    const cropList = f.crops.split(",").map((c) => c.trim().toLowerCase());
    const suppliesCrop = cropList.includes(cropId.toLowerCase());

    // Channel check
    if (channel === "WHATSAPP" && !f.whatsappEnabled) continue;
    if (channel === "SMS" && !f.smsEnabled) continue;

    let matchScore = 50; // base score
    if (suppliesCrop) matchScore += 30;
    if (f.capacityKg >= requiredKg) matchScore += 10;
    matchScore += Math.floor(f.reliability / 10);

    let reason = "";
    if (suppliesCrop) {
      reason = `Supplies ${cropId}, high reliability rating (${f.reliability}%), located in ${f.village}.`;
    } else {
      reason = `Active farmer in ${f.village}, available capacity ${f.capacityKg} kg.`;
    }

    candidates.push({
      farmerId: f.id,
      farmerName: f.name,
      phone: f.phone,
      whatsappNumber: f.whatsappNumber,
      village: f.village,
      crops: cropList,
      reliability: f.reliability,
      rating: f.rating,
      capacityKg: f.capacityKg,
      matchScore,
      reason,
    });
  }

  candidates.sort((a, b) => b.matchScore - a.matchScore);
  const bestMatch = candidates.length > 0 ? candidates[0] : null;

  return { bestMatch, candidates };
}

/** Format default requirement message for farmer preview */
export function generateFarmerRequirementMessage(
  farmerName: string,
  cropName: string,
  quantityKg: number,
  unit: string = "kg",
  dateStr?: string
): string {
  const date = dateStr || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `🌾 *FARMER CROP REQUIREMENT*

Hello ${farmerName},

KottamCart requires the following crop supply for our community market:

📦 *${cropName}* — ${quantityKg} ${unit}

📅 Required Date: ${date}
📍 Delivery Location: Madurai Central Hub

Please reply to confirm your availability and price.

Regards,
KottamCart Operations Team 🌱`;
}
