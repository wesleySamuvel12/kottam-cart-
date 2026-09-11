import { PrismaClient } from "@prisma/client";
import { PRODUCTS, CUSTOMERS, FARMERS, GROUPS } from "../src/lib/koottam/data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding KottamCart Database...");

  // 1. Seed Groups
  for (const groupName of GROUPS) {
    await prisma.group.upsert({
      where: { name: groupName },
      update: {},
      create: { name: groupName, hubId: "h1" },
    });
  }

  // 2. Seed Farmers
  let farmerPhoneIdx = 1;
  for (const f of FARMERS) {
    const phone = `91987654320${farmerPhoneIdx++}`;
    await prisma.farmer.upsert({
      where: { id: f.id },
      update: {
        name: f.name,
        phone,
        whatsappNumber: phone,
        village: f.locationId === "dindigul" ? "Dindigul" : "Madurai",
        crops: f.products.join(","),
        rating: f.rating,
        reliability: f.reliability,
        capacityKg: f.capacityKg,
      },
      create: {
        id: f.id,
        name: f.name,
        phone,
        whatsappNumber: phone,
        village: f.locationId === "dindigul" ? "Dindigul" : "Madurai",
        crops: f.products.join(","),
        preferredChannel: "WHATSAPP",
        whatsappEnabled: true,
        smsEnabled: true,
        status: "Active",
        rating: f.rating,
        reliability: f.reliability,
        capacityKg: f.capacityKg,
      },
    });
  }

  // 3. Seed Products
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        ta: p.ta,
        category: p.category,
        unit: p.unit,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        marketLow: p.marketLow,
        marketHigh: p.marketHigh,
        shelfLifeDays: p.shelfLifeDays,
        trend: p.trend,
        trendPct: p.trendPct,
      },
      create: {
        id: p.id,
        name: p.name,
        ta: p.ta,
        category: p.category,
        unit: p.unit,
        costPrice: p.costPrice,
        sellPrice: p.sellPrice,
        marketLow: p.marketLow,
        marketHigh: p.marketHigh,
        shelfLifeDays: p.shelfLifeDays,
        trend: p.trend,
        trendPct: p.trendPct,
        available: true,
      },
    });
  }

  // 4. Seed Customers with formatted phone numbers (E.164: 9198765432X)
  let phoneIdx = 10;
  for (const c of CUSTOMERS) {
    const phone = `9198765432${phoneIdx++}`;
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        group: c.group,
        locationId: c.locationId,
        avgBasketValue: c.avgBasketValue,
        orderFreqDays: c.orderFreqDays,
        lastOrderDays: c.lastOrderDays,
        totalOrders: c.totalOrders,
        churnProb: c.churnProb,
        status: c.status,
      },
      create: {
        id: c.id,
        name: c.name,
        phone: phone,
        group: c.group,
        locationId: c.locationId,
        avgBasketValue: c.avgBasketValue,
        orderFreqDays: c.orderFreqDays,
        lastOrderDays: c.lastOrderDays,
        totalOrders: c.totalOrders,
        churnProb: c.churnProb,
        status: c.status,
      },
    });
  }

  // 5. Seed customer with phone 919942445964
  await prisma.customer.upsert({
    where: { phone: "919942445964" },
    update: {},
    create: {
      id: "c9942",
      name: "KottamCart User",
      phone: "919942445964",
      group: "Group A — Anna Nagar",
      locationId: "madurai",
      avgBasketValue: 350,
      orderFreqDays: 4,
      totalOrders: 12,
      status: "Active",
    },
  });

  // 6. Seed initial historical orders for c1043 & c1049
  const c1043 = await prisma.customer.findUnique({ where: { id: "c1043" } });
  if (c1043) {
    await prisma.order.upsert({
      where: { id: "KC-10391" },
      update: {},
      create: {
        id: "KC-10391",
        customerId: c1043.id,
        customerPhone: c1043.phone,
        status: "Completed",
        subtotal: 185,
        deliveryCharge: 0,
        totalAmount: 185,
        pickupLocation: "Madurai Central Hub",
        paymentStatus: "Paid",
        items: {
          create: [
            { productId: "tomato", productName: "Tomato", quantity: 2, unit: "kg", unitPrice: 42, totalPrice: 84 },
            { productId: "onion", productName: "Onion", quantity: 2, unit: "kg", unitPrice: 38, totalPrice: 76 },
            { productId: "coriander", productName: "Coriander", quantity: 2.5, unit: "bundle", unitPrice: 10, totalPrice: 25 },
          ],
        },
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
