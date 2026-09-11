import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWhatsAppText } from "@/lib/koottam/whatsapp";

export const runtime = "nodejs";

/**
 * GET Handler: Fetch Admin WhatsApp Monitoring logs & statistics
 */
export async function GET(req: NextRequest) {
  try {
    const logs = await db.whatsAppLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { customer: true },
    });

    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { customer: true, items: true },
    });

    const sentCount = logs.filter((l) => l.status === "Sent").length;
    const deliveredCount = logs.filter((l) => l.status === "Delivered").length;
    const readCount = logs.filter((l) => l.status === "Read").length;
    const failedCount = logs.filter((l) => l.status === "Failed").length;

    return NextResponse.json({
      logs,
      orders,
      stats: {
        totalMessages: logs.length,
        sentCount,
        deliveredCount,
        readCount,
        failedCount,
        totalOrders: orders.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch logs" }, { status: 500 });
  }
}

/**
 * POST Handler: Retry failed message or send admin broadcast message
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messageId } = body;

    if (action === "retry" && messageId) {
      const log = await db.whatsAppLog.findUnique({
        where: { messageId },
      });

      if (!log) {
        return NextResponse.json({ error: "Log record not found" }, { status: 404 });
      }

      // Re-send text message
      const res = await sendWhatsAppText(log.phone, log.body, log.customerId ?? undefined);

      await db.whatsAppLog.update({
        where: { messageId },
        data: { status: "Sent", error: null },
      });

      return NextResponse.json({ success: true, res });
    }

    return NextResponse.json({ error: "Invalid admin action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Admin action failed" }, { status: 500 });
  }
}
