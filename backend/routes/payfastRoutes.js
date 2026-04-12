import express from "express";
import crypto from "crypto";
import Order from "../models/orderModel.js";
import { sendOrderConfirmationEmail } from "../utils/emailService.js";

const router = express.Router();

// Live PayFast credentials
const PAYFAST_MERCHANT_ID = "10000100";
const PAYFAST_MERCHANT_KEY = "46f0cd694581a";
const PAYFAST_PASSPHRASE = "Graphics_7598";

// Generate PayFast signature
const generateSignature = (data, passPhrase) => {
  const keyOrder = [
    "merchant_id",
    "merchant_key",
    "return_url",
    "cancel_url",
    "notify_url",
    "name_first",
    "email_address",
    "m_payment_id",
    "amount",
    "item_name",
  ];

  let pfOutput = "";

  for (let key of keyOrder) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") {
      pfOutput += `${key}=${encodeURIComponent(String(value).trim()).replace(
        /%20/g,
        "+"
      )}&`;
    }
  }

  pfOutput = pfOutput.slice(0, -1);

  if (passPhrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(
      /%20/g,
      "+"
    )}`;
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
};

// Generate IPN signature
const generateIPNSignature = (data, passPhrase) => {
  let pfOutput = "";
  const keys = Object.keys(data).filter(k => k !== "signature").sort();

  for (let key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") {
      pfOutput += `${key}=${encodeURIComponent(String(value).trim()).replace(
        /%20/g,
        "+"
      )}&`;
    }
  }

  pfOutput = pfOutput.slice(0, -1);

  if (passPhrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(
      /%20/g,
      "+"
    )}`;
  }

  return crypto.createHash("md5").update(pfOutput).digest("hex");
};

// ==========================
// CREATE PAYFAST SESSION
// ==========================
router.post("/session", (req, res) => {
  const order = req.body;

  const formData = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: `https://mekawc.com/order/${order._id}?payment=success`,
    cancel_url: `https://mekawc.com/order/${order._id}`,
    notify_url: `https://mekawc.com/api/payfast/notify`,
    name_first: order.user?.name || "Customer",
    email_address: order.user?.email || "customer@example.com",
    m_payment_id: order._id,
    amount: Number(order.totalPrice).toFixed(2),
    item_name: order.orderItems.map(i => i.name).join(", "),
  };

  formData.signature = generateSignature(formData, PAYFAST_PASSPHRASE);

  res.json(formData);
});

// ==========================
// PAYFAST IPN HANDLER
// ==========================
router.post("/notify", async (req, res) => {
  try {
    const pfData = { ...req.body };
    const receivedSignature = pfData.signature;
    delete pfData.signature;

    const generatedSignature = generateIPNSignature(
      pfData,
      PAYFAST_PASSPHRASE
    );

    if (receivedSignature !== generatedSignature) {
      return res.status(400).send("Invalid signature");
    }

    if (pfData.payment_status !== "COMPLETE") {
      return res.status(200).send("OK");
    }

    const order = await Order.findById(pfData.m_payment_id).populate(
      "user",
      "name email"
    );

    if (!order || order.isPaid) {
      return res.status(200).send("OK");
    }

    const paidAmount = parseFloat(pfData.amount_gross);
    const expectedAmount = parseFloat(order.totalPrice.toFixed(2));

    if (Math.abs(paidAmount - expectedAmount) > 0.01) {
      return res.status(400).send("Amount mismatch");
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: pfData.pf_payment_id,
      status: pfData.payment_status,
      email_address: pfData.email_address,
    };

    const updatedOrder = await order.save();
    
    console.log("=== EMAIL DEBUG ===");
console.log("Order ID:", updatedOrder._id);
console.log("User email from order:", updatedOrder.user.email);
console.log("Payment email from PayFast:", pfData.email_address);


    // ✅ Send confirmation email safely
    try {
      const emailResult = await sendOrderConfirmationEmail(
        updatedOrder,
        paidAmount.toFixed(2),
        "ZAR"
      );
      console.log("SendGrid result:", emailResult);
    } catch (emailErr) {
      console.error("Email failed but payment processed:", emailErr.message);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("IPN Error:", error.message);
    res.status(500).send("Server error");
  }
});

// ==========================
// SENDGRID TEST ROUTE
// ==========================
router.get("/test-sendgrid", async (req, res) => {
  try {
    const result = await sendOrderConfirmationEmail(
      {
        _id: "TEST123",
        user: {
          name: "Lerato",
          email: "mekalwd1@gmail.com",
        },
        createdAt: new Date(),
        paymentMethod: "PayFast",
        orderItems: [],
        itemsPrice: 0,
        shippingPrice: 0,
        vatPrice: 0,
        shippingAddress: {
          address: "Test",
          city: "Paarl",
          postalCode: "7646",
          country: "South Africa",
          phone: "000",
        },
      },
      "0.00",
      "ZAR"
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
