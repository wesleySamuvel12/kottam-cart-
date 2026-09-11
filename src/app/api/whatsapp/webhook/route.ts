import { NextRequest, NextResponse } from "next/server";
import { WHATSAPP_CONFIG, sendWhatsAppText } from "@/lib/koottam/whatsapp";
import { processIncomingWhatsAppMessage } from "@/lib/koottam/state-machine";

export const runtime = "nodejs";

/**
 * GET Handler: Official WhatsApp Webhook Verification
 * Meta sends hub.mode, hub.verify_token, hub.challenge to verify endpoint ownership.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_CONFIG.verifyToken) {
    console.log("WhatsApp Webhook Verified Successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed. Invalid verify token." }, { status: 403 });
}

/**
 * POST Handler: Official WhatsApp Incoming Messages & Event Webhook
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Check if payload contains entry -> changes -> value -> messages
    const entry = payload.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: "ignored_empty_payload" }, { status: 200 });
    }

    // Process incoming message
    if (value.messages && value.messages.length > 0) {
      const message = value.messages[0];
      const fromPhone = message.from;
      const messageId = message.id;

      let body = "";
      let buttonPayload = "";
      let listPayload = "";

      if (message.type === "text") {
        body = message.text?.body || "";
      } else if (message.type === "interactive") {
        const interactive = message.interactive;
        if (interactive?.type === "button_reply") {
          buttonPayload = interactive.button_reply?.id || "";
          body = interactive.button_reply?.title || "";
        } else if (interactive?.type === "list_reply") {
          listPayload = interactive.list_reply?.id || "";
          body = interactive.list_reply?.title || "";
        }
      } else if (message.type === "button") {
        buttonPayload = message.button?.payload || message.button?.text || "";
        body = message.button?.text || "";
      }

      // Execute conversation state machine safely
      try {
        await processIncomingWhatsAppMessage({
          messageId,
          phone: fromPhone,
          body,
          buttonPayload,
          listPayload,
        });
      } catch (err: any) {
        console.error("Error processing WhatsApp state machine:", err);
        // Customer-facing error fallback
        await sendWhatsAppText(
          fromPhone,
          "Sorry, we're having trouble processing your request right now. Please try again."
        );
      }
    }

    // Process message delivery / read status updates from Meta
    if (value.statuses && value.statuses.length > 0) {
      const statusObj = value.statuses[0];
      const statusMsgId = statusObj.id;
      const statusVal = statusObj.status; // sent, delivered, read, failed

      const formattedStatus =
        statusVal === "delivered"
          ? "Delivered"
          : statusVal === "read"
          ? "Read"
          : statusVal === "failed"
          ? "Failed"
          : "Sent";

      try {
        const { db } = await import("@/lib/db");
        await db.whatsAppLog.updateMany({
          where: { messageId: statusMsgId },
          data: { status: formattedStatus },
        });
      } catch (err) {
        console.error("Error updating message status:", err);
      }
    }

    // Return HTTP 200 OK immediately as required by Meta Webhooks to prevent webhook suspension
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: any) {
    console.error("WhatsApp Webhook Endpoint Error:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
