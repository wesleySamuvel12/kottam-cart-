import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWhatsAppText } from "@/lib/koottam/whatsapp";

export const runtime = "nodejs";

// In-Memory Fallback Dataset for WhatsApp Logs
export let localWhatsAppLogsStore: any[] = [
  {
    id: "wal_101",
    messageId: "wamid.HBgL919876543210_01",
    phone: "919876543210",
    customerId: "c1042",
    direction: "INBOUND",
    type: "text",
    body: "🛒 *New WhatsApp Order Request*\nCustomer: Meenakshi Sundaram\nItems: Tomato 2kg, Onion 1kg, Curry Leaves 2 bundles\nPickup: Anna Nagar Hub",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    customer: { id: "c1042", name: "Meenakshi Sundaram", group: "Group A — Anna Nagar", phone: "919876543210" },
  },
  {
    id: "wal_102",
    messageId: "wamid.HBgL919876543210_02",
    phone: "919876543210",
    customerId: "c1042",
    direction: "OUTBOUND",
    type: "text",
    body: "✅ *Order KC-10482 Confirmed!*\nItems: Tomato 2kg, Onion 1kg, Curry Leaves 2 bundles\nTotal: ₹215 (Free Delivery)\nPickup Location: Madurai Central Hub @ 5:30 PM",
    status: "Delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    customer: { id: "c1042", name: "Meenakshi Sundaram", group: "Group A — Anna Nagar", phone: "919876543210" },
  },
  {
    id: "wal_103",
    messageId: "wamid.HBgL919876543211_01",
    phone: "919876543211",
    customerId: "c1043",
    direction: "INBOUND",
    type: "text",
    body: "Can I check the delivery status of my order KC-10481?",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    customer: { id: "c1043", name: "Karthik Raja", group: "Group B — Thallakulam", phone: "919876543211" },
  },
  {
    id: "wal_104",
    messageId: "wamid.HBgL919876543211_02",
    phone: "919876543211",
    customerId: "c1043",
    direction: "OUTBOUND",
    type: "status",
    body: "🚚 *Order Update (KC-10481)*\nStatus: Departing\nTempo Traveller #1 has loaded your items from Ramesh Kumar's farm in Alanganallur. ETA: 20 minutes.",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    customer: { id: "c1043", name: "Karthik Raja", group: "Group B — Thallakulam", phone: "919876543211" },
  },
  {
    id: "wal_105",
    messageId: "wamid.HBgL919876543212_01",
    phone: "919876543212",
    customerId: "c1044",
    direction: "OUTBOUND",
    type: "text",
    body: "🌾 *Farmer Requirement Broadcast*\nProcurement request sent to Sankar M for 200kg fresh Onions & Potatoes.",
    status: "Sent",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    customer: { id: "c1044", name: "Priya Sharma", group: "Group A — Anna Nagar", phone: "919876543212" },
  },
  {
    id: "wal_106",
    messageId: "wamid.HBgL919876543213_01",
    phone: "919876543213",
    customerId: "c1045",
    direction: "OUTBOUND",
    type: "text",
    body: "⚠️ *Delivery Reminder*: Your order is ready for pickup at K.K. Nagar Hub.",
    status: "Failed",
    error: "Carrier network timeout (SMS / WhatsApp retry queued)",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    customer: { id: "c1045", name: "Arjun Veeran", group: "Group C — K.K. Nagar", phone: "919876543213" },
  },
  {
    id: "wal_107",
    messageId: "wamid.HBgL919876543214_01",
    phone: "919876543214",
    customerId: "c1046",
    direction: "OUTBOUND",
    type: "status",
    body: "🎉 *Order Completed (KC-10478)*\nThank you for supporting local farmers! Your order has been collected.",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    customer: { id: "c1046", name: "Anitha Parthiban", group: "Group D — Vandiyur", phone: "919876543214" },
  },
];

// In-Memory Fallback Dataset for Customer Orders
export let localWhatsAppOrdersStore: any[] = [
  {
    id: "KC-10482",
    customerId: "c1042",
    customerPhone: "919876543210",
    status: "Confirmed",
    subtotal: 190,
    deliveryCharge: 25,
    totalAmount: 215,
    pickupLocation: "Madurai Central Hub",
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    customer: { id: "c1042", name: "Meenakshi Sundaram", group: "Group A — Anna Nagar", phone: "919876543210" },
    items: [
      { id: "i1", productId: "tomato", productName: "Tomato", quantity: 2, unit: "kg", unitPrice: 54, totalPrice: 108 },
      { id: "i2", productId: "onion", productName: "Onion", quantity: 1, unit: "kg", unitPrice: 42, totalPrice: 42 },
      { id: "i3", productId: "curryleaf", productName: "Curry Leaves", quantity: 2, unit: "bundle", unitPrice: 8, totalPrice: 16 },
    ],
  },
  {
    id: "KC-10481",
    customerId: "c1043",
    customerPhone: "919876543211",
    status: "Departing",
    subtotal: 310,
    deliveryCharge: 0,
    totalAmount: 310,
    pickupLocation: "Thallakulam Hub",
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customer: { id: "c1043", name: "Karthik Raja", group: "Group B — Thallakulam", phone: "919876543211" },
    items: [
      { id: "i4", productId: "drumstick", productName: "Drumstick", quantity: 1.5, unit: "kg", unitPrice: 60, totalPrice: 90 },
      { id: "i5", productId: "brinjal", productName: "Brinjal", quantity: 2, unit: "kg", unitPrice: 48, totalPrice: 96 },
      { id: "i6", productId: "coriander", productName: "Coriander", quantity: 3, unit: "bundle", unitPrice: 10, totalPrice: 30 },
    ],
  },
  {
    id: "KC-10480",
    customerId: "c1044",
    customerPhone: "919876543212",
    status: "Dispatched",
    subtotal: 240,
    deliveryCharge: 25,
    totalAmount: 265,
    pickupLocation: "Madurai Central Hub",
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    customer: { id: "c1044", name: "Priya Sharma", group: "Group A — Anna Nagar", phone: "919876543212" },
    items: [
      { id: "i7", productId: "ginger", productName: "Ginger", quantity: 0.5, unit: "kg", unitPrice: 90, totalPrice: 45 },
      { id: "i8", productId: "garlic", productName: "Garlic", quantity: 1, unit: "kg", unitPrice: 120, totalPrice: 120 },
      { id: "i9", productId: "lemon", productName: "Lemon", quantity: 1, unit: "kg", unitPrice: 66, totalPrice: 66 },
    ],
  },
  {
    id: "KC-10479",
    customerId: "c1047",
    customerPhone: "919876543215",
    status: "Cultivation Requested",
    subtotal: 340,
    deliveryCharge: 0,
    totalAmount: 340,
    pickupLocation: "K.K. Nagar Hub",
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    customer: { id: "c1047", name: "Suresh Kumar", group: "Group C — K.K. Nagar", phone: "919876543215" },
    items: [
      { id: "i10", productId: "banana", productName: "Banana", quantity: 2, unit: "dozen", unitPrice: 54, totalPrice: 108 },
      { id: "i11", productId: "potato", productName: "Potato", quantity: 3, unit: "kg", unitPrice: 38, totalPrice: 114 },
      { id: "i12", productId: "bhindi", productName: "Bhindi", quantity: 1, unit: "kg", unitPrice: 45, totalPrice: 45 },
    ],
  },
  {
    id: "KC-10478",
    customerId: "c1046",
    customerPhone: "919876543214",
    status: "Completed",
    subtotal: 200,
    deliveryCharge: 25,
    totalAmount: 225,
    pickupLocation: "Vandiyur Hub",
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    customer: { id: "c1046", name: "Anitha Parthiban", group: "Group D — Vandiyur", phone: "919876543214" },
    items: [
      { id: "i13", productId: "spinach", productName: "Spinach", quantity: 4, unit: "bundle", unitPrice: 12, totalPrice: 48 },
      { id: "i14", productId: "tomato", productName: "Tomato", quantity: 3, unit: "kg", unitPrice: 54, totalPrice: 162 },
    ],
  },
];

/**
 * GET Handler: Fetch Admin WhatsApp Monitoring logs & statistics with DB fallback
 */
export async function GET(req: NextRequest) {
  let logs: any[] = [];
  let orders: any[] = [];

  try {
    logs = await db.whatsAppLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { customer: true },
    });

    orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { customer: true, items: true },
    });

    if (!logs || logs.length === 0) {
      logs = localWhatsAppLogsStore;
    }
    if (!orders || orders.length === 0) {
      orders = localWhatsAppOrdersStore;
    }
  } catch (err: any) {
    console.warn("DB connection offline, using sample WhatsApp logs and orders:", err?.message);
    logs = localWhatsAppLogsStore;
    orders = localWhatsAppOrdersStore;
  }

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
    isFallback: logs === localWhatsAppLogsStore,
  });
}

/**
 * POST Handler: Retry failed message or send admin broadcast message
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messageId } = body;

    if (action === "retry" && messageId) {
      try {
        const log = await db.whatsAppLog.findUnique({
          where: { messageId },
        });

        if (log) {
          await sendWhatsAppText(log.phone, log.body, log.customerId ?? undefined);
          await db.whatsAppLog.update({
            where: { messageId },
            data: { status: "Sent", error: null },
          });
        }
      } catch (dbErr: any) {
        console.warn("DB offline, updating message status in-memory:", dbErr?.message);
      }

      // Update in local store
      const localLog = localWhatsAppLogsStore.find((l) => l.messageId === messageId);
      if (localLog) {
        localLog.status = "Sent";
        localLog.error = null;
      }

      return NextResponse.json({ success: true, messageId });
    }

    return NextResponse.json({ error: "Invalid admin action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Admin action failed" }, { status: 500 });
  }
}
