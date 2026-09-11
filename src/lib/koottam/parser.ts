// KottamCart — Multilingual (Tamil, Tanglish, English) Order Parser & Validator.

import { db } from "../db";

export interface ParsedItemCandidate {
  rawProduct: string;
  quantity: number;
  unit: string;
}

export interface ValidatedOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ValidationResult {
  valid: boolean;
  items: ValidatedOrderItem[];
  errors: string[];
  totalAmount: number;
}

// Synonyms dictionary mapping Tamil script, Tanglish spellings, and English names to Product IDs
const PRODUCT_SYNONYMS: Record<string, string[]> = {
  tomato: ["tomato", "tomatoes", "தக்காளி", "thakkali", "thakkaliye", "thakali"],
  onion: ["onion", "onions", "வெங்காயம்", "venkayam", "vengayam", "vengaayam"],
  potato: ["potato", "potatoes", "உருளைக்கிழங்கு", "urulaikizhangu", "urulai", "urulaikkizhangu"],
  brinjal: ["brinjal", "eggplant", "கத்தரிக்காய்", "katharikai", "kattarikai", "kathari"],
  bhindi: ["ladyfinger", "lady's finger", "bhindi", "okra", "வெண்டைக்காய்", "vendaikai", "vendakkai", "vendai"],
  carrot: ["carrot", "carrots", "கேரட்", "kerat"],
  beans: ["beans", "bean", "பீன்ஸ்", "peans"],
  spinach: ["spinach", "palak", "கீரை", "keerai", "kirai"],
  coriander: ["coriander", "cilantro", "கொத்தமல்லி", "kothamalli", "kothamalliye"],
  curryleaf: ["curry leaf", "curry leaves", "கறிவேப்பிலை", "kariveppilai", "karivepilai", "karivepilai"],
  drumstick: ["drumstick", "drumsticks", "முருங்கைக்காய்", "murungakkai", "murungai"],
  banana: ["banana", "bananas", "வாழைப்பழம்", "vazhaipazham", "valapalam", "vazhai"],
  lemon: ["lemon", "lemons", "எலுமிச்சை", "elumichai", "elimichai"],
  ginger: ["ginger", "இஞ்சி", "inji", "inchi"],
  garlic: ["garlic", "பூண்டு", "poondu", "pondu"],
};

/** Number word mappings */
const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  half: 0.5,
  "1/2": 0.5,
  "1/4": 0.25,
  quarter: 0.25,
  ஒன்று: 1,
  இரண்டு: 2,
  மூன்று: 3,
  நான்கு: 4,
  ஐந்து: 5,
  அரை: 0.5,
  கால்: 0.25,
  ஒரு: 1,
  ரெண்டு: 2,
  ரண்டு: 2,
};

/** Match raw item string to canonical product ID */
export function resolveProductId(rawTerm: string): string | null {
  const clean = rawTerm.trim().toLowerCase();
  for (const [id, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    for (const syn of synonyms) {
      if (clean === syn || clean.includes(syn) || syn.includes(clean)) {
        return id;
      }
    }
  }
  return null;
}

/** Parse text like "2 kg tomato, 1 kg carrot, 2 kg onion" or "Anna, 2 kilo thakkali, 1 kilo carrot" */
export function parseNaturalLanguageOrder(text: string): ParsedItemCandidate[] {
  if (!text || typeof text !== "string") return [];

  const candidates: ParsedItemCandidate[] = [];
  // Split message by commas, 'and', 'மற்றும்', or newlines
  const segments = text
    .split(/[,;\n]|\band\b|\bமற்றும்\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const segment of segments) {
    // Regex pattern matching quantity + unit + product OR product + quantity + unit
    // Examples: "2 kg tomato", "2 kilo thakkali", "thakkali 2kg", "2kg", "half kg tomato", "2 கிலோ தக்காளி"
    
    // 1. Try format: [Quantity] [Unit] [Product] (e.g. "2 kg tomato", "2 kilo thakkali", "1/2 kg carrot")
    const matchQtyFirst = segment.match(
      /^(\d+(?:\.\d+)?|\b(?:one|two|three|four|five|half|quarter|1\/2|1\/4|ஒரு|இரண்டு|மூன்று|ரெண்டு|அரை|கால்)\b)\s*(kg|kilo|kilos|g|gram|grams|kiloes|கிலோ|bundle|bundles|கட்டுகள்|dozen|dozens|டஜன்)?\s*(.*)$/i
    );

    // 2. Try format: [Product] [Quantity] [Unit] (e.g. "tomato 2 kg", "thakkali 2 kilo")
    const matchProdFirst = segment.match(
      /^(.*?)\s+(\d+(?:\.\d+)?|\b(?:one|two|three|four|five|half|quarter|1\/2|1\/4|ஒரு|இரண்டு|மூன்று|ரெண்டு|அரை|கால்)\b)\s*(kg|kilo|kilos|g|gram|grams|kiloes|கிலோ|bundle|bundles|கட்டுகள்|dozen|dozens|டஜன்)?$/i
    );

    if (matchQtyFirst && matchQtyFirst[3].trim()) {
      const rawQtyStr = matchQtyFirst[1].toLowerCase();
      const rawUnitStr = (matchQtyFirst[2] || "").toLowerCase();
      const rawProdStr = matchQtyFirst[3].trim();

      const qty = NUMBER_WORDS[rawQtyStr] ?? parseFloat(rawQtyStr);
      if (!isNaN(qty) && qty > 0) {
        candidates.push({
          rawProduct: rawProdStr,
          quantity: qty,
          unit: normalizeUnit(rawUnitStr),
        });
        continue;
      }
    } else if (matchProdFirst && matchProdFirst[1].trim()) {
      const rawProdStr = matchProdFirst[1].trim();
      const rawQtyStr = matchProdFirst[2].toLowerCase();
      const rawUnitStr = (matchProdFirst[3] || "").toLowerCase();

      const qty = NUMBER_WORDS[rawQtyStr] ?? parseFloat(rawQtyStr);
      if (!isNaN(qty) && qty > 0) {
        candidates.push({
          rawProduct: rawProdStr,
          quantity: qty,
          unit: normalizeUnit(rawUnitStr),
        });
        continue;
      }
    }
  }

  return candidates;
}

function normalizeUnit(rawUnit: string): string {
  const u = rawUnit.toLowerCase().trim();
  if (["kilo", "kilos", "kiloes", "kg", "கிலோ", "g", "gram"].includes(u)) return "kg";
  if (["bundle", "bundles", "கட்டுகள்", "kattu"].includes(u)) return "bundle";
  if (["dozen", "dozens", "டஜன்"].includes(u)) return "dozen";
  return "kg"; // Default fallback
}

/** Strictly validate parsed candidate items against active database product inventory & pricing */
export async function validateOrderCandidateItems(
  candidates: ParsedItemCandidate[]
): Promise<ValidationResult> {
  const errors: string[] = [];
  const items: ValidatedOrderItem[] = [];
  let totalAmount = 0;

  if (candidates.length === 0) {
    return {
      valid: false,
      items: [],
      errors: ["No valid order items could be recognized."],
      totalAmount: 0,
    };
  }

  // Fetch current database product inventory
  const dbProducts = await db.product.findMany({ where: { available: true } });
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  for (const candidate of candidates) {
    const productId = resolveProductId(candidate.rawProduct);

    if (!productId) {
      errors.push(`Vegetable "${candidate.rawProduct}" is not found in our catalog.`);
      continue;
    }

    const product = productMap.get(productId);
    if (!product) {
      errors.push(`Sorry, ${candidate.rawProduct} is currently out of stock.`);
      continue;
    }

    if (candidate.quantity <= 0) {
      errors.push(`Invalid quantity for ${product.name}. Please specify a quantity greater than 0.`);
      continue;
    }

    // Product unit enforcement
    const expectedUnit = product.unit;
    const finalUnit = candidate.unit || expectedUnit;

    // Calculate authoritative price from database
    const unitPrice = product.sellPrice;
    const itemTotal = candidate.quantity * unitPrice;

    items.push({
      productId: product.id,
      productName: product.name,
      quantity: candidate.quantity,
      unit: finalUnit,
      unitPrice,
      totalPrice: itemTotal,
    });

    totalAmount += itemTotal;
  }

  return {
    valid: items.length > 0 && errors.length === 0,
    items,
    errors,
    totalAmount,
  };
}
