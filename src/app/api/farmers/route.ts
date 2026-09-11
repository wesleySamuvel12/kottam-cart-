import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhoneNumber } from "@/lib/koottam/whatsapp";
import { suggestBestFarmer } from "@/lib/koottam/farmer-matcher";

export const runtime = "nodejs";

/** GET: List all farmers or suggest best farmer */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cropId = searchParams.get("cropId");
    const requiredKg = searchParams.get("requiredKg");
    const channel = searchParams.get("channel") as "WHATSAPP" | "SMS" | null;

    if (cropId && requiredKg) {
      const match = await suggestBestFarmer(
        cropId,
        parseFloat(requiredKg) || 10,
        channel || "WHATSAPP"
      );
      return NextResponse.json(match);
    }

    const farmers = await db.farmer.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ farmers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch farmers" }, { status: 500 });
  }
}

/** POST: Add new Farmer contact with phone validation & duplicate check */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, village, crops, preferredChannel, whatsappEnabled, smsEnabled } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Farmer name must be at least 2 characters" }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    // Duplicate check
    const existing = await db.farmer.findUnique({
      where: { phone: normalizedPhone },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Farmer with phone number +${normalizedPhone} already exists (${existing.name})` },
        { status: 400 }
      );
    }

    const newFarmer = await db.farmer.create({
      data: {
        name: name.trim(),
        phone: normalizedPhone,
        whatsappNumber: normalizedPhone,
        village: village || "Madurai",
        crops: crops || "tomato,onion,potato",
        preferredChannel: preferredChannel || "WHATSAPP",
        whatsappEnabled: whatsappEnabled !== false,
        smsEnabled: smsEnabled !== false,
        status: "Active",
      },
    });

    return NextResponse.json({ success: true, farmer: newFarmer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create farmer" }, { status: 500 });
  }
}
