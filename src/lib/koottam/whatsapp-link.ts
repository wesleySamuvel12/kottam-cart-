// KottamCart — WhatsApp Link & Dynamic Order Message Generator

export interface CartItem {
  productId: string;
  name: string;
  ta?: string;
  quantity: number;
  unit: string;
  price?: number;
}

const PRODUCT_EMOJIS: Record<string, string> = {
  tomato: "🍅",
  onion: "🧅",
  potato: "🥔",
  brinjal: "🍆",
  bhindi: "🥒",
  carrot: "🥕",
  beans: "🫛",
  spinach: "🥬",
  coriander: "🌿",
  curryleaf: "🍃",
  drumstick: "🌿",
  banana: "🍌",
  lemon: "🍋",
  ginger: "🫚",
  garlic: "🧄",
};

/** Get appropriate emoji for a product */
export function getProductEmoji(productId: string, name: string): string {
  const normalizedId = productId.toLowerCase();
  if (PRODUCT_EMOJIS[normalizedId]) {
    return PRODUCT_EMOJIS[normalizedId];
  }
  const lowerName = name.toLowerCase();
  if (lowerName.includes("tomato") || lowerName.includes("தக்காளி")) return "🍅";
  if (lowerName.includes("onion") || lowerName.includes("வெங்காயம்")) return "🧅";
  if (lowerName.includes("potato") || lowerName.includes("உருளை")) return "🥔";
  if (lowerName.includes("brinjal") || lowerName.includes("கத்தரி")) return "🍆";
  if (lowerName.includes("carrot") || lowerName.includes("கேரட்")) return "🥕";
  if (lowerName.includes("spinach") || lowerName.includes("கீரை")) return "🥬";
  if (lowerName.includes("lemon") || lowerName.includes("எலுமிச்சை")) return "🍋";
  if (lowerName.includes("banana") || lowerName.includes("வாழை")) return "🍌";
  return "📦";
}

/**
 * Generate formatted WhatsApp message for a single product or full cart
 */
export function generateWhatsAppOrderMessage(
  items: CartItem[],
  includePrice: boolean = false
): string {
  const validItems = items.filter((item) => item.quantity > 0);

  if (validItems.length === 0) {
    return "";
  }

  if (validItems.length === 1) {
    const item = validItems[0];
    const emoji = getProductEmoji(item.productId, item.name);
    const displayName = item.ta ? `${item.name} (${item.ta})` : item.name;
    const priceText = includePrice && item.price ? ` — ₹${item.price * item.quantity}` : "";

    return `Hi KottamCart 👋

I would like to order:

${emoji} ${displayName} — ${item.quantity} ${item.unit}${priceText}

Please confirm my order.`;
  }

  // Multiple items
  const itemLines = validItems
    .map((item) => {
      const emoji = getProductEmoji(item.productId, item.name);
      const displayName = item.ta ? `${item.name} (${item.ta})` : item.name;
      const priceText = includePrice && item.price ? ` — ₹${item.price * item.quantity}` : "";
      return `${emoji} ${displayName} — ${item.quantity} ${item.unit}${priceText}`;
    })
    .join("\n");

  return `Hi KottamCart 👋

I would like to place an order:

${itemLines}

Please confirm my order.`;
}

/**
 * Generate full URL-encoded WhatsApp link for single or cart items
 */
export function getWhatsAppClickToChatUrl(
  items: CartItem[],
  phone: string = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919942445964",
  includePrice: boolean = false
): { url: string; message: string } {
  const message = generateWhatsAppOrderMessage(items, includePrice);
  if (!message) {
    return { url: "", message: "" };
  }

  const normalizedPhone = phone.replace(/\D/g, "");
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${normalizedPhone}?text=${encodedText}`;

  return { url, message };
}

/**
 * Open WhatsApp with pre-filled message safely (Desktop/Mobile support)
 * Does NOT create a DB order — stage A only.
 */
export function openWhatsAppOrder(
  items: CartItem[],
  phone: string = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919942445964",
  includePrice: boolean = false
): { success: boolean; message: string; url: string; error?: string } {
  const validItems = items.filter((item) => item.quantity > 0);

  if (validItems.length === 0) {
    return {
      success: false,
      message: "",
      url: "",
      error: "Please add at least one product before ordering.",
    };
  }

  const { url, message } = getWhatsAppClickToChatUrl(items, phone, includePrice);

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return {
    success: true,
    message,
    url,
  };
}
