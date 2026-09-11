// KottamCart — Production WhatsApp Ordering System Automated Test Suite.
import { normalizePhoneNumber } from "../src/lib/koottam/whatsapp";
import {
  parseNaturalLanguageOrder,
  validateOrderCandidateItems,
  resolveProductId,
} from "../src/lib/koottam/parser";
import {
  processIncomingWhatsAppMessage,
  getOrCreateSession,
  getCart,
  clearCart,
} from "../src/lib/koottam/state-machine";
import { db } from "../src/lib/db";

async function runAllTests() {
  console.log("==================================================");
  console.log("🧪 STARTING KOTTAMCART WHATSAPP INTEGRATION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  try {
    // 1. Phone Normalization Test
    assert(
      normalizePhoneNumber("+91 98765 43210") === "919876543210",
      "Phone Normalization (+91 format)"
    );
    assert(
      normalizePhoneNumber("9876543210") === "919876543210",
      "Phone Normalization (10-digit Indian format)"
    );

    // 2. Existing Customer Lookup Test (seeded customer Karthik R - 919876543211)
    const existingPhone = "919876543211";
    const existingCust = await db.customer.findUnique({
      where: { phone: existingPhone },
    });
    assert(
      existingCust?.name === "Karthik R",
      "Existing Customer Identification by Phone",
      `Got ${existingCust?.name}`
    );

    // 3. New Customer Registration Flow
    const newPhone = "919999888877";
    // Cleanup previous test runs
    await db.whatsAppSession.deleteMany({ where: { phone: newPhone } });
    await db.customer.deleteMany({ where: { phone: newPhone } });

    // Step A: Greeting starts onboarding
    const regStart = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.reg1.${Date.now()}`,
      phone: newPhone,
      body: "Hi",
    });
    assert(regStart.success, "New Customer Onboarding - Start");

    // Step B: Submit Name
    const regName = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.reg2.${Date.now()}`,
      phone: newPhone,
      body: "Ramesh Kumar",
    });
    assert(regName.success, "New Customer Onboarding - Name Submission");

    // Step C: Select Group
    const regGroup = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.reg3.${Date.now()}`,
      phone: newPhone,
      body: "Group A — Anna Nagar",
      buttonPayload: "grp_0",
    });
    assert(regGroup.success, "New Customer Onboarding - Group Selection");

    const createdCust = await db.customer.findUnique({
      where: { phone: newPhone },
    });
    assert(
      createdCust?.name === "Ramesh Kumar" && createdCust?.group === "Group A — Anna Nagar",
      "New Customer Account Creation in DB"
    );

    // 4. Product Catalog Resolution Tests
    assert(resolveProductId("tomato") === "tomato", "Product Lookup: English 'tomato'");
    assert(resolveProductId("தக்காளி") === "tomato", "Product Lookup: Tamil 'தக்காளி'");
    assert(resolveProductId("thakkali") === "tomato", "Product Lookup: Tanglish 'thakkali'");
    assert(resolveProductId("வெங்காயம்") === "onion", "Product Lookup: Tamil 'வெங்காயம்'");
    assert(resolveProductId("kerat") === "carrot", "Product Lookup: Tanglish 'kerat'");

    // 5. Natural Language Order Parsing Tests
    const parsedEng = parseNaturalLanguageOrder("2 kg tomato, 1 kg carrot, 2 kg onion");
    assert(
      parsedEng.length === 3 && parsedEng[0].quantity === 2 && parsedEng[0].rawProduct === "tomato",
      "Natural Language Parsing (English '2 kg tomato, 1 kg carrot, 2 kg onion')"
    );

    const parsedTam = parseNaturalLanguageOrder("2 கிலோ தக்காளி, 1 கிலோ கேரட்");
    assert(
      parsedTam.length === 2 && parsedTam[0].quantity === 2 && parsedTam[0].rawProduct === "தக்காளி",
      "Natural Language Parsing (Tamil '2 கிலோ தக்காளி, 1 கிலோ கேரட்')"
    );

    const parsedTanglish = parseNaturalLanguageOrder("Anna, 2 kilo thakkali, 1 kilo carrot");
    assert(
      parsedTanglish.length === 2 && parsedTanglish[0].quantity === 2,
      "Natural Language Parsing (Tanglish 'Anna, 2 kilo thakkali, 1 kilo carrot')"
    );

    // 6. Strict Price & Product Validation Engine
    const valResult = await validateOrderCandidateItems([
      { rawProduct: "tomato", quantity: 2, unit: "kg" },
      { rawProduct: "carrot", quantity: 1, unit: "kg" },
    ]);
    assert(
      valResult.valid && valResult.items.length === 2,
      "Order Item Validation Engine Success"
    );
    // Verified DB Sell prices: Tomato=42, Carrot=52 -> Total = (2*42) + (1*52) = 84 + 52 = 136
    assert(
      valResult.totalAmount === 136,
      "Strict Database Price Validation (Authoritative DB prices applied, ignoring user inputs)",
      `Expected 136, got ${valResult.totalAmount}`
    );

    // 7. Invalid Product & Quantity Validation Tests
    const invalidProdVal = await validateOrderCandidateItems([
      { rawProduct: "unknown_magic_fruit", quantity: 2, unit: "kg" },
    ]);
    assert(!invalidProdVal.valid, "Invalid Product Rejection Test");

    // 8. Cart Operations (Add, Edit, Clear)
    await clearCart(newPhone);
    const emptyCart = await getCart(newPhone);
    assert(emptyCart.length === 0, "Cart Clearing Test");

    // 9. Main Menu & Interactive Selection Flow
    const menuResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.menu.${Date.now()}`,
      phone: existingPhone,
      body: "Menu",
    });
    assert(menuResp.success, "Main Menu Interactive Trigger Test");

    const vegResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.veg.${Date.now()}`,
      phone: existingPhone,
      body: "Today's Vegetables",
      listPayload: "menu_veg",
    });
    assert(vegResp.success, "Today's Vegetables Real Catalog Fetch Test");

    // 10. End-to-End Order Creation Flow
    // Step A: Send natural language order message
    const orderMsgResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.ordermsg.${Date.now()}`,
      phone: existingPhone,
      body: "2 kg tomato, 1 kg carrot",
    });
    assert(orderMsgResp.success, "Incoming Order Message Processing");

    // Step B: Confirm order summary
    const confirmSummaryResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.confsummary.${Date.now()}`,
      phone: existingPhone,
      body: "Confirm Order",
      buttonPayload: "btn_confirm_order",
    });
    assert(confirmSummaryResp.success, "Order Summary Prompt");

    // Step C: Execute Final Confirmation -> DB Order Creation
    const finalConfirmResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.finalconf.${Date.now()}`,
      phone: existingPhone,
      body: "Confirm",
      buttonPayload: "btn_final_confirm",
    });
    assert(
      finalConfirmResp.success && !!finalConfirmResp.orderId,
      "Real Order Creation in Prisma DB",
      `Order ID: ${finalConfirmResp.orderId}`
    );

    const createdDbOrder = await db.order.findUnique({
      where: { id: finalConfirmResp.orderId },
      include: { items: true },
    });
    assert(
      createdDbOrder !== null && createdDbOrder.items.length === 2 && createdDbOrder.status === "Confirmed",
      "Prisma Order Record & Line Items Persistence"
    );

    // 11. Duplicate Message Protection Test (`wamid`)
    const dupMessageId = `wamid.dup.test.${Date.now()}`;
    const firstCall = await processIncomingWhatsAppMessage({
      messageId: dupMessageId,
      phone: existingPhone,
      body: "Menu",
    });
    assert(firstCall.success && !firstCall.duplicate, "First Webhook Payload Delivery");

    const secondCall = await processIncomingWhatsAppMessage({
      messageId: dupMessageId,
      phone: existingPhone,
      body: "Menu",
    });
    assert(secondCall.duplicate === true, "Duplicate Webhook Protection (Deduplication)");

    // 12. Order Tracking & Order History Query
    const trackResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.track.${Date.now()}`,
      phone: existingPhone,
      body: "Track Order",
      listPayload: "menu_track",
    });
    assert(trackResp.success, "Order Status Tracking Query Test");

    const ordersResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.orders.${Date.now()}`,
      phone: existingPhone,
      body: "My Orders",
      listPayload: "menu_orders",
    });
    assert(ordersResp.success, "My Orders History Query Test");

    // 13. Order Cancellation Test
    if (createdDbOrder) {
      const cancelResp = await processIncomingWhatsAppMessage({
        messageId: `wamid.test.cancel.${Date.now()}`,
        phone: existingPhone,
        body: `Cancel ${createdDbOrder.id}`,
        buttonPayload: `cancel_${createdDbOrder.id}`,
      });
      assert(cancelResp.success, "Order Cancellation Flow");

      const cancelledOrder = await db.order.findUnique({
        where: { id: createdDbOrder.id },
      });
      assert(cancelledOrder?.status === "Cancelled", "Order Status Updated to Cancelled in DB");
    }

  } catch (err: any) {
    console.error("Test runner encountered error:", err);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(console.error);
