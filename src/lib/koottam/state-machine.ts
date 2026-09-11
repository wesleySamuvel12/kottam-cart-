// KottamCart — WhatsApp State Machine Engine & Flow Handler.

import { db } from "../db";
import {
  normalizePhoneNumber,
  sendWhatsAppText,
  sendWhatsAppButtons,
  sendWhatsAppList,
  sendWhatsAppPaymentLink,
} from "./whatsapp";
import {
  parseNaturalLanguageOrder,
  validateOrderCandidateItems,
  resolveProductId,
} from "./parser";
import { GROUPS } from "./data";

export type State =
  | "IDLE"
  | "MAIN_MENU"
  | "REGISTERING_NAME"
  | "REGISTERING_GROUP"
  | "VIEWING_PRODUCTS"
  | "BUILDING_CART"
  | "CONFIRMING_CART"
  | "ORDER_CREATED"
  | "VIEWING_ORDERS"
  | "TRACKING_ORDER";

/** Deduplicate incoming message IDs to protect against webhook retries */
export async function isDuplicateMessage(messageId: string): Promise<boolean> {
  if (!messageId) return false;
  const existing = await db.whatsAppLog.findUnique({
    where: { messageId },
  });
  return !!existing;
}

/** Retrieve or initialize conversation state for a phone number */
export async function getOrCreateSession(phone: string) {
  const normalized = normalizePhoneNumber(phone);
  let session = await db.whatsAppSession.findUnique({
    where: { phone: normalized },
    include: { customer: true },
  });

  if (!session) {
    // Check if customer exists by phone
    const customer = await db.customer.findUnique({
      where: { phone: normalized },
    });

    session = await db.whatsAppSession.create({
      data: {
        phone: normalized,
        customerId: customer?.id ?? null,
        state: customer ? "IDLE" : "REGISTERING_NAME",
      },
      include: { customer: true },
    });
  }

  return session;
}

/** Update conversation state */
export async function updateSessionState(
  phone: string,
  state: State,
  metadata?: { tempName?: string; tempGroup?: string; lastMessageId?: string }
) {
  const normalized = normalizePhoneNumber(phone);
  return db.whatsAppSession.update({
    where: { phone: normalized },
    data: {
      state,
      tempName: metadata?.tempName,
      tempGroup: metadata?.tempGroup,
      lastMessageId: metadata?.lastMessageId,
    },
  });
}

/** Retrieve customer cart */
export async function getCart(phone: string) {
  const normalized = normalizePhoneNumber(phone);
  const cartRecord = await db.whatsAppCart.findUnique({
    where: { phone: normalized },
  });
  if (!cartRecord) return [];
  try {
    return JSON.parse(cartRecord.itemsJson);
  } catch {
    return [];
  }
}

/** Save customer cart */
export async function saveCart(phone: string, items: any[], customerId?: string) {
  const normalized = normalizePhoneNumber(phone);
  return db.whatsAppCart.upsert({
    where: { phone: normalized },
    update: {
      itemsJson: JSON.stringify(items),
      customerId,
    },
    create: {
      phone: normalized,
      customerId,
      itemsJson: JSON.stringify(items),
    },
  });
}

/** Clear customer cart */
export async function clearCart(phone: string) {
  const normalized = normalizePhoneNumber(phone);
  return db.whatsAppCart.upsert({
    where: { phone: normalized },
    update: { itemsJson: "[]" },
    create: { phone: normalized, itemsJson: "[]" },
  });
}

/** Send standard Main Menu buttons */
export async function sendMainMenu(phone: string, customerName: string) {
  const text = `Welcome to KottamCart 🥕🥦

Hello ${customerName}! What would you like to do today?`;

  const sections = [
    {
      title: "Order & Catalog",
      rows: [
        { id: "menu_order", title: "1️⃣ Place an Order", description: "Select or type fresh vegetables" },
        { id: "menu_veg", title: "2️⃣ Today's Vegetables", description: "Browse current prices & availability" },
        { id: "menu_cart", title: "3️⃣ My Cart", description: "Review items in your cart" },
      ],
    },
    {
      title: "Orders & Support",
      rows: [
        { id: "menu_orders", title: "4️⃣ My Orders", description: "View recent order history" },
        { id: "menu_track", title: "5️⃣ Track Order", description: "Check latest order status" },
        { id: "menu_help", title: "6️⃣ Help", description: "Contact KottamCart support" },
      ],
    },
  ];

  await sendWhatsAppList(phone, "Welcome to KottamCart 🥕", text, "Choose Option", sections);
  await updateSessionState(phone, "MAIN_MENU");
}

/** Process incoming webhook message payload */
export async function processIncomingWhatsAppMessage(payload: {
  messageId: string;
  phone: string;
  body: string;
  buttonPayload?: string;
  listPayload?: string;
}) {
  const normalized = normalizePhoneNumber(payload.phone);
  const messageId = payload.messageId;

  // 1. Deduplication check
  if (await isDuplicateMessage(messageId)) {
    console.log(`Duplicate WhatsApp message ${messageId} ignored.`);
    return { success: true, duplicate: true };
  }

  // 2. Fetch session and customer
  let session = await getOrCreateSession(normalized);
  let customer = session.customerId
    ? await db.customer.findUnique({ where: { id: session.customerId } })
    : await db.customer.findUnique({ where: { phone: normalized } });

  // Log incoming message
  await db.whatsAppLog.create({
    data: {
      messageId,
      phone: normalized,
      customerId: customer?.id,
      direction: "INBOUND",
      type: payload.buttonPayload || payload.listPayload ? "button" : "text",
      body: payload.body || payload.buttonPayload || payload.listPayload || "",
      status: "Delivered",
    },
  });

  const text = (payload.body || "").trim();
  const choice = payload.buttonPayload || payload.listPayload || text;
  const cleanLower = choice.toLowerCase();

  // Reset or Greeting keywords
  if (["hi", "hello", "start", "menu", "vanakkam", "வணக்கம்"].includes(cleanLower)) {
    if (!customer) {
      await updateSessionState(normalized, "REGISTERING_NAME");
      await sendWhatsAppText(
        normalized,
        `Welcome to KottamCart! 🥕🥦\n\nIt looks like you're new here. Please reply with your *Full Name* to get started:`
      );
      return { success: true };
    }
    await sendMainMenu(normalized, customer.name);
    return { success: true };
  }

  // 3. New Customer Onboarding Flow
  if (!customer) {
    if (session.state === "REGISTERING_NAME" || session.state === "IDLE") {
      const name = text;
      if (!name || name.length < 2) {
        await sendWhatsAppText(normalized, "Please enter a valid name (at least 2 characters):");
        return { success: true };
      }

      await updateSessionState(normalized, "REGISTERING_GROUP", { tempName: name });

      // Group selection buttons
      const buttons = GROUPS.slice(0, 3).map((g, i) => ({
        id: `grp_${i}`,
        title: g.split(" — ")[1] || g,
      }));

      await sendWhatsAppButtons(
        normalized,
        `Thank you, ${name}! Please select your community/group location:`,
        buttons
      );
      return { success: true };
    }

    if (session.state === "REGISTERING_GROUP") {
      let selectedGroup = GROUPS[0];
      if (choice.startsWith("grp_")) {
        const idx = parseInt(choice.replace("grp_", ""));
        selectedGroup = GROUPS[idx] || GROUPS[0];
      } else {
        const found = GROUPS.find((g) => g.toLowerCase().includes(cleanLower));
        if (found) selectedGroup = found;
      }

      const newCustomer = await db.customer.create({
        data: {
          name: session.tempName || "Valued Customer",
          phone: normalized,
          group: selectedGroup,
          locationId: "madurai",
        },
      });

      await db.whatsAppSession.update({
        where: { phone: normalized },
        data: {
          customerId: newCustomer.id,
          state: "MAIN_MENU",
          tempName: null,
          tempGroup: null,
        },
      });

      await sendWhatsAppText(
        normalized,
        `✅ Registration complete! Welcome to KottamCart, ${newCustomer.name} (${newCustomer.group}).`
      );
      await sendMainMenu(normalized, newCustomer.name);
      return { success: true };
    }
  }

  // 4. Existing Customer Flow Handlers
  const customerName = customer?.name || "Customer";

  // Global navigation commands
  if (choice === "menu_order" || cleanLower === "1" || cleanLower === "place order" || cleanLower === "place an order") {
    return handleShowOrderMenu(normalized);
  }

  if (choice === "menu_veg" || cleanLower === "2" || cleanLower === "today's vegetables" || cleanLower === "todays vegetables") {
    return handleShowTodaysVegetables(normalized);
  }

  if (choice === "menu_cart" || cleanLower === "3" || cleanLower === "my cart" || cleanLower === "cart") {
    return handleShowCart(normalized);
  }

  if (choice === "menu_orders" || cleanLower === "4" || cleanLower === "my orders") {
    return handleShowMyOrders(normalized, customer!.id);
  }

  if (choice === "menu_track" || cleanLower === "5" || cleanLower === "track order") {
    return handleTrackOrder(normalized, customer!.id);
  }

  if (choice === "menu_help" || cleanLower === "6" || cleanLower === "help") {
    await sendWhatsAppText(
      normalized,
      `🌾 *KottamCart Help & Support*

KottamCart delivers fresh vegetables directly from local farmers to your community hub!

📍 Hub Location: Madurai Central Hub
⏰ Delivery/Pickup Window: 5:00 PM – 7:00 PM
📞 Customer Care: +91 98765 00000

Reply with *Menu* to return to the main menu.`
    );
    return { success: true };
  }

  // Cart actions
  if (choice === "btn_confirm_order" || cleanLower === "confirm order") {
    return handleConfirmOrderSummary(normalized, customer!);
  }

  if (choice === "btn_final_confirm" || cleanLower === "confirm") {
    return handleExecuteCreateOrder(normalized, customer!);
  }

  if (choice === "btn_clear_cart" || cleanLower === "clear cart") {
    await clearCart(normalized);
    await updateSessionState(normalized, "MAIN_MENU");
    await sendWhatsAppText(normalized, "🗑 Your cart has been cleared.");
    await sendMainMenu(normalized, customerName);
    return { success: true };
  }

  if (choice === "btn_edit_cart" || cleanLower === "edit cart") {
    await updateSessionState(normalized, "BUILDING_CART");
    await sendWhatsAppText(
      normalized,
      `✏️ *Edit Cart*

Send the vegetable and quantity you would like to order or update.
Example:
*Tomato 2kg, Carrot 1kg*`
    );
    return { success: true };
  }

  if (choice === "btn_cancel_order" || cleanLower === "cancel") {
    await updateSessionState(normalized, "MAIN_MENU");
    await sendWhatsAppText(normalized, "❌ Order setup cancelled.");
    await sendMainMenu(normalized, customerName);
    return { success: true };
  }

  // Handle interactive item addition (e.g. `add_tomato`)
  if (choice.startsWith("add_")) {
    const prodId = choice.replace("add_", "");
    const product = await db.product.findUnique({ where: { id: prodId } });
    if (product) {
      const currentCart = await getCart(normalized);
      const existingIdx = currentCart.findIndex((i: any) => i.productId === prodId);
      if (existingIdx >= 0) {
        currentCart[existingIdx].quantity += 1;
        currentCart[existingIdx].totalPrice = currentCart[existingIdx].quantity * product.sellPrice;
      } else {
        currentCart.push({
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unit: product.unit,
          unitPrice: product.sellPrice,
          totalPrice: product.sellPrice,
        });
      }
      await saveCart(normalized, currentCart, customer!.id);
      await sendWhatsAppText(
        normalized,
        `✅ Added 1 ${product.unit} of *${product.name}* (₹${product.sellPrice}/${product.unit}) to your cart.`
      );
      return handleShowCart(normalized);
    }
  }

  // Handle Order Cancellation for placed orders (e.g. `cancel_KC-10482`)
  if (choice.startsWith("cancel_")) {
    const orderId = choice.replace("cancel_", "");
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (order && order.customerId === customer!.id && order.status === "Confirmed") {
      await db.order.update({
        where: { id: orderId },
        data: { status: "Cancelled" },
      });
      await sendWhatsAppText(
        normalized,
        `❌ Order *${orderId}* has been successfully cancelled in KottamCart.`
      );
      return { success: true };
    }
  }

  // Natural Language Order Parsing fallback
  const candidateItems = parseNaturalLanguageOrder(text);
  if (candidateItems.length > 0) {
    const validation = await validateOrderCandidateItems(candidateItems);
    if (validation.valid && validation.items.length > 0) {
      await saveCart(normalized, validation.items, customer!.id);
      await sendWhatsAppText(
        normalized,
        `🛒 *Cart Updated from Message!*\n\nParsed ${validation.items.length} item(s).`
      );
      return handleShowCart(normalized);
    } else {
      await sendWhatsAppText(
        normalized,
        `⚠️ *Could not add items:*\n${validation.errors.join("\n")}\n\nPlease try again or select from Today's Vegetables.`
      );
      return { success: true };
    }
  }

  // Unknown message default fallback
  await sendWhatsAppText(
    normalized,
    `I didn't understand that. Please select an option from the menu or type your order (e.g. *2 kg tomato, 1 kg carrot*).`
  );
  await sendMainMenu(normalized, customerName);
  return { success: true };
}

/** Show Today's Vegetables with live DB prices & availability */
async function handleShowTodaysVegetables(phone: string) {
  const products = await db.product.findMany({
    where: { available: true },
    orderBy: { name: "asc" },
  });

  const emojis: Record<string, string> = {
    tomato: "🍅",
    onion: "🧅",
    potato: "🥔",
    brinjal: "🍆",
    bhindi: "🌱",
    carrot: "🥕",
    beans: "🫛",
    spinach: "🥬",
    coriander: "🌿",
    curryleaf: "🍃",
    drumstick: "🥢",
    banana: "🍌",
    lemon: "🍋",
    ginger: "🫚",
    garlic: "🧄",
  };

  let msg = `🛒 *KottamCart Today's Fresh Vegetables*\n\n`;
  for (const p of products) {
    const emoji = emojis[p.id] || "🥦";
    msg += `${emoji} *${p.name}* (${p.ta}) — ₹${p.sellPrice}/${p.unit}\n`;
  }
  msg += `\nPrices are calculated directly from current KottamCart farmer market data.`;

  await sendWhatsAppButtons(phone, msg, [
    { id: "menu_order", title: "🛒 Place Order" },
    { id: "menu_cart", title: "🛍 View Cart" },
    { id: "menu_start", title: "🏠 Main Menu" },
  ]);
  await updateSessionState(phone, "VIEWING_PRODUCTS");
  return { success: true };
}

/** Show interactive order selection menu */
async function handleShowOrderMenu(phone: string) {
  const products = await db.product.findMany({ where: { available: true } });

  const rows = products.slice(0, 10).map((p) => ({
    id: `add_${p.id}`,
    title: `+1 ${p.unit} ${p.name}`.slice(0, 24),
    description: `₹${p.sellPrice}/${p.unit} (${p.ta})`,
  }));

  const sections = [{ title: "Select Fresh Produce", rows }];

  await sendWhatsAppList(
    phone,
    "Place an Order 🥕",
    "Choose vegetables from the list below, or type your order directly (e.g. *2 kg tomato, 1 kg carrot*):",
    "Select Vegetables",
    sections
  );
  await updateSessionState(phone, "BUILDING_CART");
  return { success: true };
}

/** Show customer's active WhatsApp Cart */
async function handleShowCart(phone: string) {
  const cartItems = await getCart(phone);
  if (cartItems.length === 0) {
    await sendWhatsAppButtons(
      phone,
      `🛒 *Your KottamCart is empty.*\n\nWould you like to view today's fresh vegetables?`,
      [
        { id: "menu_veg", title: "🥦 Today's Vegetables" },
        { id: "menu_order", title: "➕ Add Items" },
      ]
    );
    await updateSessionState(phone, "MAIN_MENU");
    return { success: true };
  }

  let subtotal = 0;
  let text = `🛒 *Your KottamCart*\n\n`;

  for (const item of cartItems) {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;
    text += `• *${item.productName}*\n  ${item.quantity} ${item.unit} × ₹${item.unitPrice} = ₹${itemTotal}\n\n`;
  }

  text += `-------------\n*Total: ₹${subtotal}*`;

  await sendWhatsAppButtons(phone, text, [
    { id: "btn_confirm_order", title: "✅ Confirm Order" },
    { id: "btn_edit_cart", title: "✏️ Edit Cart" },
    { id: "btn_clear_cart", title: "🗑 Clear Cart" },
  ]);
  await updateSessionState(phone, "CONFIRMING_CART");
  return { success: true };
}

/** Show final order confirmation prompt before creating order in DB */
async function handleConfirmOrderSummary(phone: string, customer: any) {
  const cartItems = await getCart(phone);
  if (cartItems.length === 0) {
    return handleShowCart(phone);
  }

  let subtotal = 0;
  let text = `🛒 *KottamCart Order Confirmation*\n\n*Customer:* ${customer.name}\n*Community Group:* ${customer.group}\n\n*Items:*\n`;

  for (const item of cartItems) {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;
    text += `• ${item.productName} — ${item.quantity} ${item.unit} (₹${itemTotal})\n`;
  }

  text += `\n*Total: ₹${subtotal}*\n📍 *Pickup/Delivery:* KottamCart Hub (${customer.group})\n\nDo you want to confirm and place this order?`;

  await sendWhatsAppButtons(phone, text, [
    { id: "btn_final_confirm", title: "✅ Confirm" },
    { id: "btn_edit_cart", title: "✏️ Edit" },
    { id: "btn_cancel_order", title: "❌ Cancel" },
  ]);
  return { success: true };
}

/** Execute creation of real order in KottamCart database */
async function handleExecuteCreateOrder(phone: string, customer: any) {
  const cartItems = await getCart(phone);
  if (cartItems.length === 0) {
    return handleShowCart(phone);
  }

  // Recalculate prices from DB to guarantee price integrity
  const productIds = cartItems.map((i: any) => i.productId);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  let subtotal = 0;
  const verifiedOrderItems: any[] = [];

  for (const item of cartItems) {
    const dbP = productMap.get(item.productId);
    const unitPrice = dbP ? dbP.sellPrice : item.unitPrice;
    const itemTotal = item.quantity * unitPrice;
    subtotal += itemTotal;

    verifiedOrderItems.push({
      productId: item.productId,
      productName: dbP ? dbP.name : item.productName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice,
      totalPrice: itemTotal,
    });
  }

  const orderId = `KC-${Math.floor(10000 + Math.random() * 90000)}`;
  const deliveryCharge = 0;
  const totalAmount = subtotal + deliveryCharge;

  // 1. Create real KottamCart order in DB
  const newOrder = await db.order.create({
    data: {
      id: orderId,
      customerId: customer.id,
      customerPhone: phone,
      status: "Confirmed",
      subtotal,
      deliveryCharge,
      totalAmount,
      pickupLocation: `KottamCart Hub (${customer.group})`,
      paymentStatus: "Pending",
      items: {
        create: verifiedOrderItems,
      },
    },
    include: { items: true },
  });

  // 2. Clear WhatsApp cart
  await clearCart(phone);
  await updateSessionState(phone, "ORDER_CREATED");

  // 3. Send Order Confirmation message
  let itemsSummary = verifiedOrderItems
    .map((i) => `${i.productName} — ${i.quantity} ${i.unit}`)
    .join("\n");

  const confirmationMsg = `✅ *KottamCart Order Confirmed!*

Order ID: *${newOrder.id}*

🥕 *Items:*
${itemsSummary}

💰 *Total:* ₹${newOrder.totalAmount}
📍 *Pickup:* ${newOrder.pickupLocation}
Status: *Confirmed*

Thank you for ordering with KottamCart! 🌱`;

  await sendWhatsAppText(phone, confirmationMsg, customer.id);

  // Send payment link option
  await sendWhatsAppPaymentLink(phone, newOrder.id, newOrder.totalAmount, customer.id);

  return { success: true, orderId: newOrder.id };
}

/** Show Customer's Recent Orders */
async function handleShowMyOrders(phone: string, customerId: string) {
  const orders = await db.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });

  if (orders.length === 0) {
    await sendWhatsAppButtons(
      phone,
      `📦 *You have no recent orders.*`,
      [
        { id: "menu_order", title: "🥦 Place First Order" },
        { id: "menu_start", title: "🏠 Main Menu" },
      ]
    );
    await updateSessionState(phone, "MAIN_MENU");
    return { success: true };
  }

  let text = `📦 *Recent Orders*\n\n`;
  for (const o of orders) {
    text += `• *Order ${o.id}*\n  Amount: ₹${o.totalAmount} | Status: *${o.status}*\n  Items: ${o.items.map((i) => i.productName).join(", ")}\n\n`;
  }

  const buttons = orders.slice(0, 3).map((o) => ({
    id: `cancel_${o.id}`,
    title: `Cancel ${o.id}`,
  }));

  if (buttons.length > 0 && orders.some((o) => o.status === "Confirmed")) {
    await sendWhatsAppButtons(phone, text, buttons);
  } else {
    await sendWhatsAppText(phone, text);
  }
  await updateSessionState(phone, "VIEWING_ORDERS");
  return { success: true };
}

/** Show Order Tracking */
async function handleTrackOrder(phone: string, customerId: string) {
  const latestOrder = await db.order.findFirst({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (!latestOrder) {
    await sendWhatsAppText(phone, "📦 You have no active orders to track.");
    return { success: true };
  }

  const statusIcons: Record<string, string> = {
    Confirmed: "🟡 Confirmed",
    Preparing: "🟠 Preparing",
    "Ready for Pickup": "🟢 Ready for Pickup",
    Collected: "🔵 Collected",
    Completed: "✅ Completed",
    Cancelled: "❌ Cancelled",
  };

  const statusText = statusIcons[latestOrder.status] || latestOrder.status;

  const msg = `📦 *Order Tracking: ${latestOrder.id}*

Status:
${statusText}

📍 *Location:* ${latestOrder.pickupLocation}
💰 *Total:* ₹${latestOrder.totalAmount}

Items:
${latestOrder.items.map((i) => `• ${i.productName} (${i.quantity} ${i.unit})`).join("\n")}`;

  await sendWhatsAppButtons(phone, msg, [
    { id: "menu_orders", title: "📦 All Orders" },
    { id: "menu_start", title: "🏠 Main Menu" },
  ]);
  await updateSessionState(phone, "TRACKING_ORDER");
  return { success: true };
}
