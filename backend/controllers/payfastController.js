import asyncHandler from "../middleware/asyncHandler.js";
import crypto from "crypto";
import axios from "axios";
import Order from "../models/orderModel.js";
import { Resend } from "resend";

const resend = new Resend("re_drMZndTE_7vWk3E1oNXzoxMVpjrUhRjKp");

// PayFast credentials
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
const PAYFAST_URL = process.env.NODE_ENV === "production" 
  ? "https://www.payfast.co.za/eng/process"
  : "https://sandbox.payfast.co.za/eng/process";

// Generate PayFast signature
const generateSignature = (data, passPhrase = null) => {
  let pfOutput = "";
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== "") {
        pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, "+")}&`;
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(getString).digest("hex");
};

// @desc    Create PayFast payment session
// @route   POST /api/payfast/session
// @access  Private
const createPayFastSession = asyncHandler(async (req, res) => {
  const order = req.body;

  if (!order || !order._id) {
    res.status(400);
    throw new Error("Invalid order data");
  }

  const paymentData = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: `${process.env.FRONTEND_URL}/order/${order._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/order/${order._id}`,
    notify_url: `${process.env.BACKEND_URL}/api/payfast/notify`,
    name_first: order.user.name.split(" ")[0] || order.user.name,
    email_address: order.user.email,
    m_payment_id: order._id.toString(),
    amount: order.totalPrice.toFixed(2),
    item_name: `Order #${order._id}`,
  };

  // Generate signature
  const signature = generateSignature(paymentData, PAYFAST_PASSPHRASE);
  paymentData.signature = signature;

  res.json(paymentData);
});

// @desc    PayFast IPN (Instant Payment Notification) handler
// @route   POST /api/payfast/notify
// @access  Public (PayFast webhook)
const handlePayFastNotification = asyncHandler(async (req, res) => {
  console.log("PayFast IPN received:", req.body);

  const pfData = req.body;
  const pfParamString = new URLSearchParams(pfData).toString();

  // Verify signature
  const pfSignature = pfData.signature;
  delete pfData.signature;
  const generatedSignature = generateSignature(pfData, PAYFAST_PASSPHRASE);

  if (pfSignature !== generatedSignature) {
    console.error("Signature mismatch");
    res.status(400);
    throw new Error("Invalid signature");
  }

  // Verify payment status
  if (pfData.payment_status !== "COMPLETE") {
    console.log("Payment not complete:", pfData.payment_status);
    res.status(200).send("OK"); // Acknowledge receipt but don't process
    return;
  }

  // Verify source IP (optional but recommended for production)
  const validHosts = [
    "www.payfast.co.za",
    "sandbox.payfast.co.za",
    "w1w.payfast.co.za",
    "w2w.payfast.co.za",
  ];

  // Get order
  const orderId = pfData.m_payment_id;
  const order = await Order.findById(orderId).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if already paid
  if (order.isPaid) {
    console.log("Order already paid");
    res.status(200).send("OK");
    return;
  }

  // Verify amount
  const paidAmount = parseFloat(pfData.amount_gross);
  const expectedAmount = parseFloat(order.totalPrice.toFixed(2));

  if (Math.abs(paidAmount - expectedAmount) > 0.01) {
    console.error(`Amount mismatch: paid ${paidAmount}, expected ${expectedAmount}`);
    res.status(400);
    throw new Error("Incorrect amount paid");
  }

  // Update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: pfData.pf_payment_id,
    status: pfData.payment_status,
    update_time: new Date().toISOString(),
    email_address: pfData.email_address,
  };

  const updatedOrder = await order.save();

  // Send confirmation email
  try {
    await resend.emails.send({
      from: "mekawc4lwd@gmail.com",
      to: order.user.email,
      subject: "Order Confirmation - Meka.WC",
      html: `<h2>Order Confirmation</h2>
             <p>Hi ${order.user.name},</p>
             <p>Thank you for your order! Your payment has been successfully processed via PayFast.</p>
             <p><strong>Order ID:</strong> ${order._id}</p>
             <p><strong>Total Paid:</strong> R${paidAmount.toFixed(2)}</p>
             <p>We will notify you when your order is shipped.</p>
             <p>Best Regards,</p>
             <p><strong>Meka.WC Team</strong></p>`,
    });
    console.log("Confirmation email sent successfully");
  } catch (emailError) {
    console.error("Error sending email:", emailError);
  }

  console.log("Order updated successfully:", updatedOrder._id);
  res.status(200).send("OK");
});

// @desc    Verify PayFast payment (for manual checks)
// @route   POST /api/payfast/verify/:id
// @access  Private
const verifyPayFastPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.isPaid) {
    res.json({ message: "Order is already paid", order });
    return;
  }

  // In production, you would verify with PayFast API
  // For now, we'll just return the order status
  res.json({ 
    message: "Payment verification in progress", 
    order,
    isPaid: order.isPaid 
  });
});

export {
  createPayFastSession,
  handlePayFastNotification,
  verifyPayFastPayment,
};