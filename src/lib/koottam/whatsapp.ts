// KottamCart — Official WhatsApp Business API Service & Messaging Utilities.

import { db } from "../db";

export const WHATSAPP_CONFIG = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "mock_whatsapp_access_token",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "100000000000000",
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "100000000000001",
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "kottamcart_whatsapp_token_2026",
  apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
};

/** Normalize phone number to standard E.164 format without '+' or spaces. e.g. 919876543210 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");
  // If 10 digits starting with 6-9 (Indian mobile), prepend country code 91
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = "91" + digits;
  }
  return digits;
}

/** Record outbound message in WhatsAppLog table for admin monitoring & auditing */
export async function logWhatsAppMessage(opts: {
  messageId: string;
  phone: string;
  customerId?: string;
  direction: "INBOUND" | "OUTBOUND";
  type: string;
  body: string;
  status: "Sent" | "Delivered" | "Read" | "Failed";
  error?: string;
}) {
  try {
    await db.whatsAppLog.upsert({
      where: { messageId: opts.messageId },
      update: {
        status: opts.status,
        error: opts.error,
      },
      create: {
        messageId: opts.messageId,
        phone: opts.phone,
        customerId: opts.customerId,
        direction: opts.direction,
        type: opts.type,
        body: opts.body,
        status: opts.status,
        error: opts.error,
      },
    });
  } catch (err) {
    console.error("Failed to log WhatsApp message to DB:", err);
  }
}

/** Low-level Meta Graph API caller */
async function callWhatsAppAPI(endpoint: string, payload: any) {
  const url = `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/${endpoint}`;
  
  // If in mock or testing environment without actual Meta credentials, return simulated response
  if (!process.env.WHATSAPP_ACCESS_TOKEN || WHATSAPP_CONFIG.accessToken === "mock_whatsapp_access_token") {
    const mockId = "wamid.outbound." + Date.now() + "." + Math.floor(Math.random() * 1000);
    return {
      success: true,
      messages: [{ id: mockId }],
      isMock: true,
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `WhatsApp API error ${res.status}`);
    }
    return { ...data, success: true };
  } catch (err: any) {
    console.error("WhatsApp API Call Error:", err);
    return { success: false, error: err.message || "Failed to call WhatsApp API" };
  }
}

/** Send plain text message */
export async function sendWhatsAppText(toPhone: string, text: string, customerId?: string) {
  const normalized = normalizePhoneNumber(toPhone);
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalized,
    type: "text",
    text: { body: text },
  };

  const res = await callWhatsAppAPI("messages", payload);
  const msgId = res.messages?.[0]?.id || `wamid.out.${Date.now()}`;
  const status = res.success ? "Sent" : "Failed";

  await logWhatsAppMessage({
    messageId: msgId,
    phone: normalized,
    customerId,
    direction: "OUTBOUND",
    type: "text",
    body: text,
    status,
    error: res.error,
  });

  return res;
}

/** Send interactive quick-reply buttons (Max 3 buttons per WhatsApp rules) */
export async function sendWhatsAppButtons(
  toPhone: string,
  text: string,
  buttons: { id: string; title: string }[],
  customerId?: string
) {
  const normalized = normalizePhoneNumber(toPhone);
  const formattedButtons = buttons.slice(0, 3).map((b) => ({
    type: "reply",
    reply: {
      id: b.id,
      title: b.title.slice(0, 20), // WhatsApp button title max 20 chars
    },
  }));

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalized,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text },
      action: { buttons: formattedButtons },
    },
  };

  const res = await callWhatsAppAPI("messages", payload);
  const msgId = res.messages?.[0]?.id || `wamid.out.${Date.now()}`;
  const status = res.success ? "Sent" : "Failed";

  await logWhatsAppMessage({
    messageId: msgId,
    phone: normalized,
    customerId,
    direction: "OUTBOUND",
    type: "button",
    body: `${text}\n[Buttons: ${buttons.map((b) => b.title).join(", ")}]`,
    status,
    error: res.error,
  });

  return res;
}

/** Send interactive sectioned list menu */
export async function sendWhatsAppList(
  toPhone: string,
  headerText: string,
  bodyText: string,
  buttonLabel: string,
  sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
  customerId?: string
) {
  const normalized = normalizePhoneNumber(toPhone);
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalized,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      action: {
        button: buttonLabel.slice(0, 20),
        sections,
      },
    },
  };

  const res = await callWhatsAppAPI("messages", payload);
  const msgId = res.messages?.[0]?.id || `wamid.out.${Date.now()}`;
  const status = res.success ? "Sent" : "Failed";

  await logWhatsAppMessage({
    messageId: msgId,
    phone: normalized,
    customerId,
    direction: "OUTBOUND",
    type: "list",
    body: `${headerText}\n${bodyText}`,
    status,
    error: res.error,
  });

  return res;
}

/** Send payment link message for an order */
export async function sendWhatsAppPaymentLink(
  toPhone: string,
  orderId: string,
  amount: number,
  customerId?: string
) {
  const text = `💳 *KottamCart Payment*

Order ID: *${orderId}*
Amount Due: *₹${amount}*

Click below to complete your payment securely via UPI / Card:
https://kottamcart.in/pay/${orderId}`;

  return sendWhatsAppButtons(
    toPhone,
    text,
    [
      { id: `pay_${orderId}`, title: "💳 Pay Now" },
      { id: `track_${orderId}`, title: "📦 Check Status" },
    ],
    customerId
  );
}
