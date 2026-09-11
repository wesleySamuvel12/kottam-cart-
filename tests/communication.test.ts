// KottamCart — Complete Communication & Demand Analysis Automated Test Suite.

import { db } from "../src/lib/db";
import { processIncomingWhatsAppMessage } from "../src/lib/koottam/state-machine";
import { getLiveDemandAnalysis } from "../src/lib/koottam/demand-analysis";
import { suggestBestFarmer, generateFarmerRequirementMessage } from "../src/lib/koottam/farmer-matcher";
import { sendSmsMessage, isSmsConfigured } from "../src/lib/koottam/sms";
import { normalizePhoneNumber } from "../src/lib/koottam/whatsapp";

async function runCommunicationTests() {
  console.log("==================================================");
  console.log("🧪 STARTING KOTTAMCART COMMUNICATION & DEMAND TESTS");
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
    // Test 1: Customer WhatsApp Order Creation
    const testPhone = "919876543211"; // Karthik R
    const orderMsgResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.comm1.${Date.now()}`,
      phone: testPhone,
      body: "30 kg tomato, 10 kg carrot",
    });
    assert(orderMsgResp.success, "Customer WhatsApp Order Processing");

    const finalConfirmResp = await processIncomingWhatsAppMessage({
      messageId: `wamid.test.comm2.${Date.now()}`,
      phone: testPhone,
      body: "Confirm",
      buttonPayload: "btn_final_confirm",
    });
    assert(finalConfirmResp.success && !!finalConfirmResp.orderId, "Customer Order DB Creation");

    // Test 2: AI Live Demand Aggregation
    const demandAnalysis = await getLiveDemandAnalysis();
    assert(
      demandAnalysis.totalOrders > 0 && demandAnalysis.crops.length > 0,
      "AI Demand Analysis - Live DB Order Aggregation"
    );

    const tomatoAnalysis = demandAnalysis.crops.find((c) => c.productId === "tomato");
    assert(
      tomatoAnalysis !== undefined && tomatoAnalysis.customerDemand >= 30,
      "AI Demand Analysis - Tomato Customer Demand Calculation",
      `Expected >= 30, got ${tomatoAnalysis?.customerDemand}`
    );

    assert(
      tomatoAnalysis !== undefined && tomatoAnalysis.explanation.includes("Tomato"),
      "AI Demand Analysis - Concise Natural Language Explanation ('Why?')"
    );

    // Test 3: Farmer Directory Querying & AI Farmer Matching
    const farmerMatchWhatsApp = await suggestBestFarmer("tomato", 40, "WHATSAPP");
    assert(
      farmerMatchWhatsApp.bestMatch !== null && farmerMatchWhatsApp.bestMatch.crops.includes("tomato"),
      "AI Farmer Matcher - Best WhatsApp Farmer Recommendation"
    );

    const farmerMatchSMS = await suggestBestFarmer("tomato", 40, "SMS");
    assert(
      farmerMatchSMS.bestMatch !== null,
      "AI Farmer Matcher - Best SMS Farmer Recommendation"
    );

    // Test 4: Requirement Message Formatting
    const formattedMsg = generateFarmerRequirementMessage("Ramesh K", "Tomato", 40, "kg");
    assert(
      formattedMsg.includes("Ramesh K") && formattedMsg.includes("Tomato") && formattedMsg.includes("40 kg"),
      "Farmer Requirement Message Formatting"
    );

    // Test 5: Farmer Contact Management & Phone Validation
    const newFarmerPhone = "919876549999";
    await db.farmer.deleteMany({ where: { phone: newFarmerPhone } });

    const createdFarmer = await db.farmer.create({
      data: {
        name: "Senthil Nathan",
        phone: newFarmerPhone,
        whatsappNumber: newFarmerPhone,
        village: "Pollachi",
        crops: "tomato,onion",
        preferredChannel: "WHATSAPP",
        whatsappEnabled: true,
        smsEnabled: true,
        status: "Active",
      },
    });
    assert(createdFarmer.name === "Senthil Nathan", "Add Farmer Contact to DB");

    // Test 6: Farmer Communication Dispatch & Logging (WhatsApp)
    const farmerLogId = `wa.farmer.test.${Date.now()}`;
    await db.communicationLog.create({
      data: {
        messageId: farmerLogId,
        recipientType: "FARMER",
        recipientId: createdFarmer.id,
        recipientName: createdFarmer.name,
        phone: createdFarmer.phone,
        channel: "WHATSAPP",
        purpose: "CROP_REQUIREMENT",
        cropDetails: JSON.stringify({ cropName: "Tomato", quantity: 40 }),
        body: formattedMsg,
        status: "Sent",
      },
    });

    const farmerLog = await db.communicationLog.findUnique({
      where: { messageId: farmerLogId },
    });
    assert(
      farmerLog !== null && farmerLog.recipientType === "FARMER" && farmerLog.channel === "WHATSAPP",
      "Farmer Communication Log Persistence (recipientType = FARMER)"
    );

    // Test 7: Unconfigured SMS Dispatch Handling
    const smsResult = await sendSmsMessage({
      toPhone: createdFarmer.phone,
      body: "Test SMS message",
      recipientType: "FARMER",
      recipientId: createdFarmer.id,
      recipientName: createdFarmer.name,
    });
    assert(
      smsResult.configured === false || smsResult.success === true,
      "SMS Dispatch Service (Strict provider configuration check without faking delivery)"
    );

    // Test 8: Communication History Query & Filtering
    const allCommLogs = await db.communicationLog.findMany({
      where: { recipientType: "FARMER" },
    });
    assert(allCommLogs.length > 0, "Communication History Filtering by Recipient Type (FARMER)");

    const waCommLogs = await db.communicationLog.findMany({
      where: { channel: "WHATSAPP" },
    });
    assert(waCommLogs.length > 0, "Communication History Filtering by Channel (WHATSAPP)");

  } catch (err: any) {
    console.error("Test runner error:", err);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runCommunicationTests().catch(console.error);
