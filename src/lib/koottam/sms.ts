// KottamCart — SMS Dispatch Service & Provider Client.

import { db } from "../db";
import { normalizePhoneNumber } from "./whatsapp";

export const SMS_CONFIG = {
  apiKey: process.env.SMS_API_KEY || "",
  senderId: process.env.SMS_SENDER_ID || "KOTTAM",
  apiUrl: process.env.SMS_API_URL || "",
};

export function isSmsConfigured(): boolean {
  return Boolean(SMS_CONFIG.apiKey && SMS_CONFIG.apiUrl);
}

/**
 * Dispatch real SMS message via configured SMS Gateway Provider.
 * If credentials are missing, returns configured: false without faking message delivery.
 */
export async function sendSmsMessage(opts: {
  toPhone: string;
  body: string;
  recipientType: "CUSTOMER" | "FARMER";
  recipientId?: string;
  recipientName?: string;
  purpose?: string;
  orderId?: string;
}) {
  const normalized = normalizePhoneNumber(opts.toPhone);
  const configured = isSmsConfigured();

  if (!configured) {
    const errorMsg = "SMS service is not configured. Please set SMS_API_KEY and SMS_API_URL in environment variables.";
    
    // Record log entry as Failed due to missing configuration
    const msgId = `sms.failed.${Date.now()}.${Math.floor(Math.random() * 1000)}`;
    await db.communicationLog.create({
      data: {
        messageId: msgId,
        recipientType: opts.recipientType,
        recipientId: opts.recipientId,
        recipientName: opts.recipientName,
        phone: normalized,
        channel: "SMS",
        purpose: opts.purpose || "CROP_REQUIREMENT",
        orderId: opts.orderId,
        body: opts.body,
        status: "Failed",
        error: errorMsg,
      },
    });

    return {
      success: false,
      configured: false,
      error: errorMsg,
    };
  }

  try {
    const res = await fetch(SMS_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SMS_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: SMS_CONFIG.senderId,
        to: normalized,
        message: opts.body,
      }),
    });

    const data = await res.json();
    const success = res.ok;
    const msgId = data.messageId || `sms.${Date.now()}.${Math.floor(Math.random() * 1000)}`;
    const status = success ? "Sent" : "Failed";
    const error = success ? null : (data.error || "SMS provider request failed");

    await db.communicationLog.create({
      data: {
        messageId: msgId,
        recipientType: opts.recipientType,
        recipientId: opts.recipientId,
        recipientName: opts.recipientName,
        phone: normalized,
        channel: "SMS",
        purpose: opts.purpose || "CROP_REQUIREMENT",
        orderId: opts.orderId,
        body: opts.body,
        status,
        error,
      },
    });

    return { success, configured: true, messageId: msgId, error };
  } catch (err: any) {
    const errorMsg = err.message || "Failed to reach SMS gateway provider";
    const msgId = `sms.err.${Date.now()}`;

    await db.communicationLog.create({
      data: {
        messageId: msgId,
        recipientType: opts.recipientType,
        recipientId: opts.recipientId,
        recipientName: opts.recipientName,
        phone: normalized,
        channel: "SMS",
        purpose: opts.purpose || "CROP_REQUIREMENT",
        orderId: opts.orderId,
        body: opts.body,
        status: "Failed",
        error: errorMsg,
      },
    });

    return { success: false, configured: true, error: errorMsg };
  }
}
