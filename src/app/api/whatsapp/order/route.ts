import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PRODUCTS } from "@/lib/koottam/data";

export const runtime = "nodejs";

/**
 * POST Handler: Create a new Customer Order via WhatsApp Simulator/UI
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      group = "Group A — Anna Nagar",
      items = [],
      pickupLocation = "Madurai Central Hub",
    } = body;

    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer name, valid phone number, and at least one crop item are required." },
        { status: 400 }
      );
    }

    // Normalize phone number (E.164)
    const normalizedPhone = customerPhone.replace(/\D/g, "");
    if (!normalizedPhone || normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // 1. Find or Create Customer
    let customer = await db.customer.findFirst({
      where: {
        OR: [{ phone: normalizedPhone }, { phone: `91${normalizedPhone}` }],
      },
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: customerName,
          phone: normalizedPhone.length === 10 ? `91${normalizedPhone}` : normalizedPhone,
          group: group,
          locationId: "madurai",
          status: "Active",
        },
      });
    }

    // 2. Compute items details & pricing
    const orderItemsData: {
      productId: string;
      productName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
    }[] = [];
    let subtotal = 0;

    for (const item of items) {
      const prod = PRODUCTS.find((p) => p.id === item.productId);
      if (!prod) continue;

      const qty = parseFloat(item.quantity) || 1;
      const unitPrice = prod.sellPrice;
      const totalPrice = unitPrice * qty;
      subtotal += totalPrice;

      orderItemsData.push({
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unit: prod.unit,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
      });
    }

    if (orderItemsData.length === 0) {
      return NextResponse.json({ error: "No valid product items selected." }, { status: 400 });
    }

    const deliveryCharge = subtotal > 300 ? 0 : 25;
    const totalAmount = subtotal + deliveryCharge;

    // Generate Order ID (KC-XXXXX)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `KC-${randomSuffix}`;

    // 3. Create Order & Items in DB
    const order = await db.order.create({
      data: {
        id: orderId,
        customerId: customer.id,
        customerPhone: customer.phone,
        status: "Confirmed",
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        totalAmount: totalAmount,
        pickupLocation: pickupLocation,
        paymentStatus: "Pending",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // 4. Log incoming WhatsApp transaction message
    const itemSummary = orderItemsData
      .map((i) => `${i.productName} ${i.quantity}${i.unit}`)
      .join(", ");
    
    await db.whatsAppLog.create({
      data: {
        messageId: `wamid.HBgL${Date.now()}`,
        phone: customer.phone,
        customerId: customer.id,
        direction: "INBOUND",
        type: "text",
        body: `🛒 *New WhatsApp Order Received*\nCustomer: ${customer.name}\nItems: ${itemSummary}\nTotal: ₹${totalAmount}\nStatus: Confirmed`,
        status: "Read",
      },
    });

    // Update customer stats
    await db.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        lastOrderDays: 0,
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("Failed to create WhatsApp order:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order via WhatsApp" },
      { status: 500 }
    );
  }
}

/**
 * PATCH Handler: Update order status (e.g., Departing, Dispatched, Cultivation Requested, Completed)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required." },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: { customer: true, items: true },
    });

    // Record outbound WhatsApp notification for status change
    await db.whatsAppLog.create({
      data: {
        messageId: `wamid.STATUS_${Date.now()}`,
        phone: order.customerPhone,
        customerId: order.customerId,
        direction: "OUTBOUND",
        type: "status",
        body: `🚚 *Order Update (${orderId})*\nStatus: ${status}\nLocation: ${order.pickupLocation}`,
        status: "Sent",
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
