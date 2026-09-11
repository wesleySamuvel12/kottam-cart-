// KottamCart — AI Demand Aggregation & Crop Shortage Analysis Engine.

import { db } from "../db";
import { PRODUCTS } from "./data";

export interface CropDemandAnalysis {
  productId: string;
  cropName: string;
  ta: string;
  unit: string;
  customerDemand: number;
  availableStock: number;
  shortage: number;
  recommendedProcurement: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
}

export interface DemandAnalysisSummary {
  totalOrders: number;
  totalCustomers: number;
  totalDemandKg: number;
  totalProcurementKg: number;
  crops: CropDemandAnalysis[];
}

/** Analyze real KottamCart order data from DB and calculate crop shortages & procurement */
export async function getLiveDemandAnalysis(): Promise<DemandAnalysisSummary> {
  // 1. Fetch active confirmed/preparing orders from database
  const activeOrders = await db.order.findMany({
    where: { status: { notIn: ["Cancelled"] } },
    include: { items: true, customer: true },
  });

  const totalOrders = activeOrders.length;
  const uniqueCustomerIds = new Set(activeOrders.map((o) => o.customerId));
  const totalCustomers = uniqueCustomerIds.size;

  // 2. Aggregate demand per product
  const demandMap = new Map<string, number>();
  for (const order of activeOrders) {
    for (const item of order.items) {
      const current = demandMap.get(item.productId) || 0;
      demandMap.set(item.productId, current + item.quantity);
    }
  }

  // 3. Fetch current product inventory from DB
  const dbProducts = await db.product.findMany();
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // Default baseline stock per product if DB stock not initialized
  const baselineStockMap: Record<string, number> = {
    tomato: 65,
    onion: 50,
    potato: 40,
    brinjal: 25,
    bhindi: 20,
    carrot: 35,
    beans: 15,
    spinach: 10,
    coriander: 12,
    curryleaf: 8,
    drumstick: 15,
    banana: 20,
    lemon: 10,
    ginger: 8,
    garlic: 10,
  };

  const cropAnalyses: CropDemandAnalysis[] = [];
  let totalDemandKg = 0;
  let totalProcurementKg = 0;

  // Process all catalog products
  for (const p of PRODUCTS) {
    const dbP = productMap.get(p.id);
    const demand = demandMap.get(p.id) || 0;
    
    // Baseline simulated stock vs aggregated demand
    const stock = dbP ? baselineStockMap[p.id] || 30 : 30;
    const shortage = Math.max(0, demand - stock);
    const bufferMultiplier = 1.15; // 15% safety buffer
    const recommendedProcurement = shortage > 0 ? Math.ceil(shortage * bufferMultiplier) : 0;

    const priority: "HIGH" | "MEDIUM" | "LOW" =
      shortage >= 30 ? "HIGH" : shortage > 0 ? "MEDIUM" : "LOW";

    let explanation = "";
    if (shortage > 0) {
      explanation = `Current customer demand for ${p.name} is ${demand} ${p.unit} while available stock is ${stock} ${p.unit}. There is an estimated shortage of ${shortage} ${p.unit}. Based on confirmed customer orders and a 15% safety buffer, ${recommendedProcurement} ${p.unit} procurement is recommended.`;
    } else if (demand > 0) {
      explanation = `Customer demand for ${p.name} is ${demand} ${p.unit}. Current available stock of ${stock} ${p.unit} is sufficient to fulfill all active orders.`;
    } else {
      explanation = `No active customer orders recorded for ${p.name} today. Current stock is ${stock} ${p.unit}.`;
    }

    cropAnalyses.push({
      productId: p.id,
      cropName: p.name,
      ta: p.ta,
      unit: p.unit,
      customerDemand: demand,
      availableStock: stock,
      shortage,
      recommendedProcurement,
      priority,
      explanation,
    });

    totalDemandKg += demand;
    totalProcurementKg += recommendedProcurement;
  }

  // Sort crops: High priority & shortages first
  cropAnalyses.sort((a, b) => b.shortage - a.shortage || b.customerDemand - a.customerDemand);

  return {
    totalOrders,
    totalCustomers,
    totalDemandKg,
    totalProcurementKg,
    crops: cropAnalyses,
  };
}
