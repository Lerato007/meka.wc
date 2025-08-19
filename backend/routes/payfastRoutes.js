import express from "express";
import crypto from "crypto";

const router = express.Router();

// Generate PayFast signature
const generateSignature = (data, passPhrase) => {
  const keyOrder = [
    "merchant_id",
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

  // Remove trailing &
  pfOutput = pfOutput.slice(0, -1);

  // Append passphrase
  if (passPhrase) {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(
      /%20/g,
      "+"
    )}`;
  }

  console.log("=== PayFast Signature Debug ===");
  console.log(pfOutput);
  return crypto.createHash("md5").update(pfOutput).digest("hex");
};

// POST /api/payfast/session
router.post("/session", (req, res) => {
  const order = req.body;

  const formData = {
    merchant_id: "14472896", // Live merchant ID
    merchant_key: "mcq7fgvxgs90l", // Send only
    return_url: `http://localhost:3000/order/${order._id}`,
    cancel_url: `http://localhost:3000/order/${order._id}`,
    notify_url: "http://localhost:5000/api/payfast/notify",
    name_first: order.user?.name?.trim() || "Customer",
    email_address: order.user?.email?.trim() || "customer@example.com",
    m_payment_id: order._id,
    amount: Number(order.totalPrice || 0).toFixed(2),
    item_name: order.orderItems.map((i) => i.name.trim()).join(", ") || "Order",
  };

  // Exclude merchant_key from signature
  const { merchant_key, ...signatureData } = formData;

  // 🔑 Use **LIVE passphrase here**
  const signature = generateSignature(signatureData, "YOUR_LIVE_PASSPHRASE");
  formData.signature = signature;

  console.log("Form data sent to PayFast:", formData);
  return res.json(formData);
});

export default router;
