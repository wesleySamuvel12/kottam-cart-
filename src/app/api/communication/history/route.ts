import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET Handler: Fetch Communication Logs filtered by recipientType (CUSTOMER vs FARMER), channel (WHATSAPP vs SMS), and status
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientType = searchParams.get("recipientType");
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");

    // Fetch communication logs from CommunicationLog table
    const commLogs = await db.communicationLog.findMany({
      where: {
        recipientType: recipientType && recipientType !== "ALL" ? recipientType : undefined,
        channel: channel && channel !== "ALL" ? channel : undefined,
        status: status && status !== "ALL" ? status : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { farmer: true },
    });

    // Also fetch WhatsApp logs from WhatsAppLog table for complete unified audit
    const waLogs = await db.whatsAppLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { customer: true },
    });

    return NextResponse.json({
      communicationLogs: commLogs,
      whatsAppLogs: waLogs,
      stats: {
        totalCommLogs: commLogs.length,
        farmerLogsCount: commLogs.filter((l) => l.recipientType === "FARMER").length,
        customerLogsCount: commLogs.filter((l) => l.recipientType === "CUSTOMER").length + waLogs.length,
        whatsAppCount: commLogs.filter((l) => l.channel === "WHATSAPP").length + waLogs.length,
        smsCount: commLogs.filter((l) => l.channel === "SMS").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch communication history" }, { status: 500 });
  }
}
