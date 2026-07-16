import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import {
  getOnsitePaymentIdentifier,
  verifyItnSignature,
  confirmItnWithPayfast,
} from "../utils/payfastUtils.js";

// @desc    Generate a PayFast Onsite payment identifier for an order
// @route   POST /api/payfast/onsite/:orderId
// @access  Private
const createOnsiteIdentifier = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized for this order");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("This order has already been paid");
  }

  if (order.status === "Cancelled") {
    res.status(400);
    throw new Error("This order has been cancelled");
  }

  const [nameFirst, ...rest] = order.user.name.split(" ");
  const nameLast = rest.join(" ") || nameFirst;

  const notifyUrl = `${process.env.BACKEND_URL}/api/payfast/notify`;

  const uuid = await getOnsitePaymentIdentifier({
    amount:            Number(order.totalPrice).toFixed(2),
    item_name:         `MekaWC Order #${order._id}`,
    item_description:  `Payment for order ${order._id}`,
    name_first:        nameFirst,
    name_last:         nameLast,
    email_address:     order.user.email,
    m_payment_id:      order._id.toString(),
    notify_url:        notifyUrl,
  });

  res.json({
    uuid,
    mode: process.env.PAYFAST_MODE === "live" ? "live" : "sandbox",
  });
});

// @desc    Handle PayFast Instant Transaction Notification (ITN) webhook
// @route   POST /api/payfast/notify
// @access  Public (called by PayFast's servers only)
const handleItn = async (req, res) => {
  const pfData = req.body;

  try {
    if (!verifyItnSignature(pfData)) {
      console.error("PayFast ITN: invalid signature", pfData);
      return res.status(400).send("Invalid signature");
    }

    // Re-post the raw body back to PayFast to confirm it genuinely came from them
    const rawBody = Object.entries(pfData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    const confirmed = await confirmItnWithPayfast(rawBody);
    if (!confirmed) {
      console.error("PayFast ITN: server-to-server confirmation failed", pfData);
      return res.status(400).send("Could not confirm with PayFast");
    }

    const order = await Order.findById(pfData.m_payment_id).populate("user", "name email");
    if (!order) {
      console.error("PayFast ITN: order not found", pfData.m_payment_id);
      return res.status(404).send("Order not found");
    }

    // Guard against duplicate ITN calls (PayFast may retry notifications)
    if (order.isPaid) {
      return res.status(200).send("OK");
    }

    const expectedAmount = Number(order.totalPrice).toFixed(2);
    if (Number(pfData.amount_gross).toFixed(2) !== expectedAmount) {
      console.error("PayFast ITN: amount mismatch", pfData.amount_gross, expectedAmount);
      return res.status(400).send("Amount mismatch");
    }

    if (pfData.payment_status === "COMPLETE") {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = "Confirmed";
      order.paymentResult = {
        id:            pfData.pf_payment_id,
        status:        pfData.payment_status,
        update_time:   new Date().toISOString(),
        email_address: pfData.email_address,
      };
      order.statusHistory.push({
        status:    "Confirmed",
        note:      "Payment confirmed via PayFast",
        updatedBy: "System",
      });
      await order.save();
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("PayFast ITN processing error:", err.message);
    res.status(500).send("Server error");
  }
};

export { createOnsiteIdentifier, handleItn };