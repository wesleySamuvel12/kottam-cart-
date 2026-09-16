import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePhoneNumber } from "@/lib/koottam/whatsapp";
import { suggestBestFarmer } from "@/lib/koottam/farmer-matcher";
import { FARMERS, Farmer } from "@/lib/koottam/data";

export const runtime = "nodejs";

// In-memory fallback list if DB is offline
let localFarmersStore: any[] = [...FARMERS];

/** GET: List all farmers or suggest best farmer with graceful DB fallback */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cropId = searchParams.get("cropId");
    const requiredKg = searchParams.get("requiredKg");
    const channel = searchParams.get("channel") as "WHATSAPP" | "SMS" | null;
    const village = searchParams.get("village");
    const query = searchParams.get("query")?.toLowerCase();

    if (cropId && requiredKg) {
      const match = await suggestBestFarmer(
        cropId,
        parseFloat(requiredKg) || 10,
        channel || "WHATSAPP"
      );
      return NextResponse.json(match);
    }

    let farmerList: any[] = [];
    try {
      farmerList = await db.farmer.findMany({
        orderBy: { name: "asc" },
      });
      if (!farmerList || farmerList.length === 0) {
        farmerList = localFarmersStore;
      }
    } catch (dbErr: any) {
      console.warn("Prisma DB connection unavailable, using sample farmers dataset:", dbErr.message);
      farmerList = localFarmersStore;
    }

    // Filter by village if requested
    if (village && village !== "ALL") {
      farmerList = farmerList.filter((f) =>
        f.village?.toLowerCase().includes(village.toLowerCase())
      );
    }

    // Search query filter (matches name, ta, phone, village, or crops)
    if (query) {
      farmerList = farmerList.filter(
        (f) =>
          f.name?.toLowerCase().includes(query) ||
          f.ta?.toLowerCase().includes(query) ||
          f.phone?.includes(query) ||
          f.village?.toLowerCase().includes(query) ||
          (typeof f.crops === "string" ? f.crops : f.crops?.join(", "))?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ farmers: farmerList, count: farmerList.length, isFallback: farmerList === localFarmersStore });
  } catch (err: any) {
    return NextResponse.json({ farmers: localFarmersStore, count: localFarmersStore.length, isFallback: true });
  }
}

/** POST: Add new Farmer contact with phone validation & duplicate check */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      ta,
      phone,
      village,
      crops,
      preferredChannel,
      whatsappEnabled,
      smsEnabled,
      rating,
      reliability,
      capacityKg,
      distanceKm,
    } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Farmer name must be at least 2 characters" }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    let newFarmer: any = null;

    try {
      // Check for duplicate in DB
      const existing = await db.farmer.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Farmer with phone number +${normalizedPhone} already exists (${existing.name})` },
          { status: 400 }
        );
      }

      newFarmer = await db.farmer.create({
        data: {
          name: name.trim(),
          ta: ta?.trim() || "",
          phone: normalizedPhone,
          whatsappNumber: normalizedPhone,
          village: village || "Madurai",
          crops: crops || "tomato,onion,potato",
          preferredChannel: preferredChannel || "WHATSAPP",
          whatsappEnabled: whatsappEnabled !== false,
          smsEnabled: smsEnabled !== false,
          status: "Active",
          rating: rating ? parseFloat(rating) : 4.8,
          reliability: reliability ? parseFloat(reliability) : 95.0,
          capacityKg: capacityKg ? parseFloat(capacityKg) : 150.0,
          distanceKm: distanceKm ? parseFloat(distanceKm) : 10.0,
          lastOrderDays: 0,
        },
      });
    } catch (dbErr: any) {
      console.warn("DB offline, adding farmer to in-memory store:", dbErr.message);
      newFarmer = {
        id: `f_${Date.now()}`,
        name: name.trim(),
        ta: ta?.trim() || "",
        phone: normalizedPhone,
        whatsappNumber: normalizedPhone,
        village: village || "Madurai",
        locationId: village?.toLowerCase().includes("dindigul") ? "dindigul" : "madurai",
        crops: crops || "tomato,onion,potato",
        products: (crops || "tomato,onion,potato").split(",").map((c: string) => c.trim()),
        preferredChannel: preferredChannel || "WHATSAPP",
        whatsappEnabled: whatsappEnabled !== false,
        smsEnabled: smsEnabled !== false,
        status: "Active",
        rating: rating ? parseFloat(rating) : 4.8,
        reliability: reliability ? parseFloat(reliability) : 95.0,
        capacityKg: capacityKg ? parseFloat(capacityKg) : 150.0,
        distanceKm: distanceKm ? parseFloat(distanceKm) : 10.0,
        lastOrderDays: 0,
        createdAt: new Date().toISOString(),
      };
      localFarmersStore.unshift(newFarmer);
    }

    return NextResponse.json({ success: true, farmer: newFarmer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create farmer" }, { status: 500 });
  }
}
