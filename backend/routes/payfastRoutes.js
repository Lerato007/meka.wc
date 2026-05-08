import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  dataToString,
  generateSignature,
  pfValidSignature,
  pfValidIP,
  pfValidPaymentData,
  pfValidServerConfirmation,
} from "../utils/payfastUtils.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";
import axios from "axios";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Generate payment identifier (UUID)
// POST /api/payfast/identifier/:id
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/identifier/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const merchantId  = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passPhrase  = process.env.PAYFAST_PASSPHRASE;
    const backendUrl  = process.env.BACKEND_URL;
    const testingMode = process.env.PAYFAST_TESTING === "true";
    const pfHost      = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";

    if (!merchantId || !merchantKey) {
      res.status(500);
      throw new Error("PayFast credentials are not configured on the server");
    }

    // Field order matters for the signature — must match PayFast's attribute order
const paymentData = {
  merchant_id:   merchantId,
  merchant_key:  merchantKey,
  return_url:    `${backendUrl}/order/${order._id}`,
  cancel_url:    `${backendUrl}/order/${order._id}`,
  notify_url:    `${backendUrl}/api/payfast/notify`,
  name_first:    order.user.name.split(" ")[0],
  email_address: testingMode ? "buyer@example.com" : order.user.email,
  m_payment_id:  order._id.toString(),
  amount:        order.totalPrice.toFixed(2),
  item_name:     `Meka.WC Order ${order._id}`,
};

// Only add name_last if it has a value — blank fields affect the signature
const nameLast = order.user.name.split(" ").slice(1).join(" ");
if (nameLast) {
  paymentData.name_last = nameLast;
}

    // Append signature (signature field excluded from its own hash)
    paymentData.signature = generateSignature(paymentData, passPhrase);

    const pfParamString = dataToString(paymentData);

    console.log("📤 PayFast payment data:", JSON.stringify(paymentData, null, 2));
    console.log("📤 PayFast param string:", pfParamString);
    console.log("📤 Sending to host:", pfHost);

    let pfResponse;
    try {
      pfResponse = await axios.post(
        `https://${pfHost}/onsite/process`,
        pfParamString,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (compatible; MekaWC/1.0)",
          },
        }
      );
      console.log("✅ PayFast response status:", pfResponse.status);
      console.log("✅ PayFast response data:", JSON.stringify(pfResponse.data, null, 2));
    } catch (err) {
      console.error("❌ PayFast error status:", err.response?.status);
      console.error("❌ PayFast error headers:", JSON.stringify(err.response?.headers, null, 2));
      console.error("❌ PayFast error data:", JSON.stringify(err.response?.data, null, 2));
      console.error("❌ Param string sent:", pfParamString);
      res.status(502);
      throw new Error(`PayFast rejected the request: ${JSON.stringify(err.response?.data)}`);
    }

    const uuid = pfResponse.data?.uuid || null;

    if (!uuid) {
      res.status(502);
      throw new Error("PayFast did not return a payment identifier");
    }

    res.json({ uuid });
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — ITN (Instant Transaction Notification)
// POST /api/payfast/notify
// ─────────────────────────────────────────────────────────────────────────────
router.post("/notify", (req, res) => {
  res.status(200).send("OK");

  (async () => {
    try {
      const pfData      = req.body;
      const passPhrase  = process.env.PAYFAST_PASSPHRASE;
      const merchantId  = process.env.PAYFAST_MERCHANT_ID;
      const testingMode = process.env.PAYFAST_TESTING === "true";
      const pfHost      = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";

      console.log("📩 PayFast ITN received:", pfData);

      // Check 1: Verify signature
      const check1 = pfValidSignature(pfData, passPhrase);
      if (!check1) { console.error("❌ ITN rejected: signature invalid"); return; }
      console.log("✅ Check 1 passed: signature valid");

      // Check 2: Verify PayFast IP
      const check2 = await pfValidIP(req);
      if (!check2) { console.error("❌ ITN rejected: invalid IP"); return; }
      console.log("✅ Check 2 passed: valid IP");

      // Fetch order
      const order = await Order.findById(pfData.m_payment_id).populate("user", "name email");
      if (!order) { console.error("❌ ITN: order not found:", pfData.m_payment_id); return; }

      // Check 3: Verify amount
      const check3 = pfValidPaymentData(order.totalPrice, pfData);
      if (!check3) { console.error(`❌ ITN rejected: amount mismatch — expected R${order.totalPrice}, got R${pfData.amount_gross}`); return; }
      console.log("✅ Check 3 passed: amount matches");

      // Check 4: Server confirmation
      const check4 = await pfValidServerConfirmation(pfHost, pfData);
      if (!check4) { console.error("❌ ITN rejected: server confirmation INVALID"); return; }
      console.log("✅ Check 4 passed: server confirmation VALID");

      if (pfData.payment_status !== "COMPLETE") {
        console.log(`ℹ️  ITN status is "${pfData.payment_status}" — no action taken`);
        return;
      }

      if (order.isPaid) {
        console.log("ℹ️  ITN: order already paid — skipping:", order._id);
        return;
      }

      order.isPaid  = true;
      order.paidAt  = Date.now();
      order.paymentResult = {
        id:            pfData.pf_payment_id,
        status:        pfData.payment_status,
        update_time:   new Date().toISOString(),
        email_address: pfData.email_address || order.user.email,
      };

      const updatedOrder = await order.save();
      console.log("✅ ITN: order marked as paid:", updatedOrder._id);

      sendOrderConfirmationEmail(updatedOrder, pfData.amount_gross, "ZAR")
        .then((result) => { if (result.success) console.log("✅ Confirmation email sent"); })
        .catch((err) => { console.error("❌ Email failed:", err); });

    } catch (err) {
      console.error("❌ ITN processing error:", err);
    }
  })();
});

export default router;