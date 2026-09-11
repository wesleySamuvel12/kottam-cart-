import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWhatsAppText, normalizePhoneNumber } from "@/lib/koottam/whatsapp";
import { sendSmsMessage, isSmsConfigured } from "@/lib/koottam/sms";

export const runtime = "nodejs";

/**
 * POST Handler: Send Crop Requirement Message to Farmer via WhatsApp or SMS
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { farmerId, channel, cropName, quantity, message } = body as {
      farmerId: string;
      channel: "WHATSAPP" | "SMS";
      cropName: string;
      quantity: number;
      message: string;
    };

    if (!farmerId || !channel || !message) {
      return NextResponse.json({ error: "farmerId, channel, and message are required" }, { status: 400 });
    }

    const farmer = await db.farmer.findUnique({
      where: { id: farmerId },
    });

    if (!farmer) {
      return NextResponse.json({ error: "Farmer record not found" }, { status: 404 });
    }

    const normalizedPhone = normalizePhoneNumber(farmer.phone);

    // Channel 1: WhatsApp
    if (channel === "WHATSAPP") {
      if (!farmer.whatsappEnabled) {
        return NextResponse.json({ error: `${farmer.name} does not have WhatsApp enabled.` }, { status: 400 });
      }

      const res = await sendWhatsAppText(normalizedPhone, message);
      const msgId = res.messages?.[0]?.id || `wa.farmer.${Date.now()}`;
      const status = res.success ? "Sent" : "Failed";

      // Log in CommunicationLog table with recipientType: FARMER
      await db.communicationLog.create({
        data: {
          messageId: msgId,
          recipientType: "FARMER",
          recipientId: farmer.id,
          recipientName: farmer.name,
          phone: normalizedPhone,
          channel: "WHATSAPP",
          purpose: "CROP_REQUIREMENT",
          cropDetails: JSON.stringify({ cropName, quantity }),
          body: message,
          status,
          error: res.error,
        },
      });

      return NextResponse.json({
        success: res.success,
        channel: "WHATSAPP",
        messageId: msgId,
        status,
        error: res.error,
      });
    }

    // Channel 2: SMS
    if (channel === "SMS") {
      if (!farmer.smsEnabled) {
        return NextResponse.json({ error: `${farmer.name} does not have SMS enabled.` }, { status: 400 });
      }

      const smsResult = await sendSmsMessage({
        toPhone: normalizedPhone,
        body: message,
        recipientType: "FARMER",
        recipientId: farmer.id,
        recipientName: farmer.name,
        purpose: "CROP_REQUIREMENT",
      });

      return NextResponse.json(smsResult);
    }

    return NextResponse.json({ error: "Invalid communication channel" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to dispatch farmer message" }, { status: 500 });
  }
}
