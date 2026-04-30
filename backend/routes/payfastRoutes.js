import express from "express";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";

const router = express.Router();

// ─── Credentials from .env ONLY — never hardcode these ───────────────────────
const PAYFAST_MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE   = process.env.PAYFAST_PASSPHRASE;
const SITE_URL             = process.env.SITE_URL || "http://localhost:3000";
const BACKEND_URL          = process.env.BACKEND_URL || "http://localhost:5000";

// Sandbox for dev, live for production — toggled by NODE_ENV
const PAYFAST_HOST = process.env.NODE_ENV === "production"
  ? "www.payfast.co.za"
  : "sandbox.payfast.co.za";

const PAYFAST_URL = `https://${PAYFAST_HOST}/eng/process`;

// ─── EXACT field order required by PayFast for signature generation ───────────
// Source: https://developers.payfast.co.za/docs#step_2_signature
// WARNING: Field order MUST match this exactly — wrong order = signature mismatch
const FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "m_payment_id",
  "amount",
  "item_name",
];

// ─── Signature generator (payment form) ──────────────────────────────────────
// Builds the query string in exact field order, then MD5 hashes it
const generateSignature = (data, passPhrase) => {
  let pfOutput = "";

  for (const key of FIELD_ORDER) {
    const value = data[key];
    // Skip undefined, null, and empty string fields
    if (value !== undefined && value !== null && value !== "") {
      pfOutput += `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, "+")}&`;
    }
  }

  // Remove trailing ampersand
  pfOutput = pfOutput.slice(0, -1);

  // Append passphrase if set (strongly recommended in production)
  if (passPhrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
};

// ─── IPN Signature validator ──────────────────────────────────────────────────
// IPN uses ALL received fields (except signature itself), sorted alphabetically
const generateIPNSignature = (data, passPhrase) => {
  const keys = Object.keys(data)
    .filter((k) => k !== "signature")
    .sort(); // PayFast IPN fields are sorted alphabetically

  let pfOutput = "";
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") {
      pfOutput += `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, "+")}&`;
    }
  }

  pfOutput = pfOutput.slice(0, -1);

  if (passPhrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payfast/session
// Called by frontend OrderScreen to get signed form data
// ─────────────────────────────────────────────────────────────────────────────
router.post("/session", async (req, res) => {
  try {
    const order = req.body;

    if (!order?._id || !order?.totalPrice) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    // Truncate item_name to PayFast's 100-char limit
    const itemName = order.orderItems
      .map((i) => i.name)
      .join(", ")
      .substring(0, 100);

    // Split name into first/last for PayFast fields
    const nameParts = (order.user?.name || "Customer").split(" ");
    const nameFirst = nameParts[0] || "Customer";
    const nameLast  = nameParts.slice(1).join(" ") || "";

    const formData = {
      merchant_id:   PAYFAST_MERCHANT_ID,
      merchant_key:  PAYFAST_MERCHANT_KEY,
      return_url:    `${SITE_URL}/order/${order._id}?payment=success`,
      cancel_url:    `${SITE_URL}/order/${order._id}?payment=cancelled`,
      notify_url:    `${BACKEND_URL}/api/payfast/notify`,
      name_first:    nameFirst,
      name_last:     nameLast,
      email_address: order.user?.email || "",
      m_payment_id:  order._id.toString(),
      amount:        Number(order.totalPrice).toFixed(2),
      item_name:     itemName,
    };

    formData.signature = generateSignature(formData, PAYFAST_PASSPHRASE);

    res.json({
      ...formData,
      payfast_url:  PAYFAST_URL,
      field_order:  FIELD_ORDER,
    });
  } catch (error) {
    console.error("PayFast session error:", error.message);
    res.status(500).json({ message: "Failed to create PayFast session" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payfast/notify
// PayFast IPN webhook — called server-to-server after payment
// Must return 200 quickly or PayFast will retry
// ─────────────────────────────────────────────────────────────────────────────
router.post("/notify", async (req, res) => {
  // Respond 200 immediately so PayFast doesn't timeout and retry
  res.status(200).send("OK");

  try {
    const pfData = { ...req.body };
    const receivedSignature = pfData.signature;
    delete pfData.signature;

    // Step 1: Verify signature
    const generatedSignature = generateIPNSignature(pfData, PAYFAST_PASSPHRASE);
    if (receivedSignature !== generatedSignature) {
      console.error("❌ PayFast IPN: Invalid signature");
      console.error("Received:", receivedSignature);
      console.error("Expected:", generatedSignature);
      return;
    }

    // Step 2: Only process COMPLETE payments
    if (pfData.payment_status !== "COMPLETE") {
      console.log("PayFast IPN: Payment status not COMPLETE:", pfData.payment_status);
      return;
    }

    // Step 3: Find the order
    const order = await Order.findById(pfData.m_payment_id).populate("user", "name email");
    if (!order) {
      console.error("❌ PayFast IPN: Order not found:", pfData.m_payment_id);
      return;
    }

    // Step 4: Idempotency guard — don't process twice
    if (order.isPaid) {
      console.log("PayFast IPN: Order already paid:", order._id);
      return;
    }

    // Step 5: Verify the amount matches (within R0.01 tolerance for float rounding)
    const paidAmount     = parseFloat(pfData.amount_gross);
    const expectedAmount = parseFloat(Number(order.totalPrice).toFixed(2));
    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      console.error(`❌ PayFast IPN: Amount mismatch — paid R${paidAmount}, expected R${expectedAmount}`);
      return;
    }

    // Step 6: Mark order as paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id:            pfData.pf_payment_id,
      status:        pfData.payment_status,
      update_time:   new Date().toISOString(),
      email_address: pfData.email_address,
    };

    const updatedOrder = await order.save();
    console.log("✅ PayFast IPN: Order marked as paid:", updatedOrder._id);

    // Step 7: Send confirmation email (non-blocking — never let email failure break payment)
    try {
      await sendOrderConfirmationEmail(updatedOrder, paidAmount.toFixed(2), "ZAR");
      console.log("✅ Confirmation email sent to:", updatedOrder.user.email);
    } catch (emailErr) {
      console.error("❌ Confirmation email failed (payment still processed):", emailErr.message);
    }
  } catch (error) {
    console.error("❌ PayFast IPN processing error:", error.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payfast/verify/:orderId
// Called by frontend after user returns from PayFast
// Polls until IPN has updated isPaid (max ~20 seconds with polling)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/verify/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select("isPaid paidAt paymentResult");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ isPaid: order.isPaid, paidAt: order.paidAt });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
