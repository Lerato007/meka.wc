import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { sendOrderShippedEmail } from "../utils/emailService.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // ── Fetch products from DB ────────────────────────────────────────
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((x) => x._id) },
  });

  // ── Stock validation per size ─────────────────────────────────────
  const stockErrors = [];

  for (const itemFromClient of orderItems) {
    const product = itemsFromDB.find(
      (p) => p._id.toString() === itemFromClient._id
    );

    if (!product) {
      stockErrors.push(`Product ${itemFromClient.name} no longer exists`);
      continue;
    }

    const size = itemFromClient.size;
    const qty  = itemFromClient.qty;

    if (product.sizeStock && size) {
      const availableStock = product.sizeStock[size] || 0;
      if (qty > availableStock) {
        stockErrors.push(
          `${product.name} (${size}) — only ${availableStock} left in stock, you requested ${qty}`
        );
      }
    } else {
      // Fallback to flat countInStock
      if (qty > product.countInStock) {
        stockErrors.push(
          `${product.name} — only ${product.countInStock} left in stock`
        );
      }
    }
  }

  if (stockErrors.length > 0) {
    res.status(400);
    throw new Error(stockErrors.join(" | "));
  }

  // ── Build order items using server-side prices only ───────────────
  const dbOrderItems = orderItems.map((itemFromClient) => {
    const matchingItem = itemsFromDB.find(
      (p) => p._id.toString() === itemFromClient._id
    );
    return {
      ...itemFromClient,
      product: itemFromClient._id,
      price:   matchingItem.price,
      _id:     undefined,
    };
  });

  const { itemsPrice, vatPrice, shippingPrice, totalPrice } = calcPrices(
    dbOrderItems,
    shippingAddress
  );

  const order = new Order({
    orderItems:     dbOrderItems,
    user:           req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    vatPrice,
    shippingPrice,
    totalPrice,
    status:         "Processing",
    statusHistory:  [{ status: "Processing", note: "Order placed", updatedBy: "System" }],
  });

  const createdOrder = await order.save();

  // ── Decrement stock per size after order is saved ─────────────────
  for (const item of dbOrderItems) {
    const product = itemsFromDB.find(
      (p) => p._id.toString() === item.product.toString()
    );

    if (product && item.size && product.sizeStock) {
      product.sizeStock[item.size] = Math.max(
        0,
        (product.sizeStock[item.size] || 0) - item.qty
      );
      // pre-save hook updates countInStock automatically
      await product.save();
    } else if (product) {
      product.countInStock = Math.max(0, product.countInStock - item.qty);
      await product.save();
    }
  }

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (order) return res.status(200).json(order);
  res.status(404);
  throw new Error("Order not found");
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const validStatuses = ["Processing", "Confirmed", "Packed", "Dispatched", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  order.status = status;
  order.statusHistory.push({
    status,
    note:      note || "",
    updatedBy: req.user.name,
  });

  // Sync isDelivered flag when status reaches Delivered
  if (status === "Delivered") {
    order.isDelivered  = true;
    order.deliveredAt  = Date.now();
  }

  const updatedOrder = await order.save();

  // Send shipping email when dispatched
  if (status === "Dispatched") {
    const trackingNumber = req.body.trackingNumber || "Will be provided shortly";
    sendOrderShippedEmail(updatedOrder, trackingNumber)
      .then(() => console.log("Shipping email sent:", order.user.email))
      .catch((err) => console.error("Shipping email failed:", err.message));
  }

  res.json(updatedOrder);
});

// @desc    Update order to delivered (kept for backwards compat)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status      = "Delivered";
  order.statusHistory.push({
    status:    "Delivered",
    note:      "Marked as delivered by admin",
    updatedBy: req.user.name,
  });

  const updatedOrder = await order.save();

  const trackingNumber = req.body.trackingNumber || "Will be provided shortly";
  sendOrderShippedEmail(updatedOrder, trackingNumber)
    .then(() => console.log("Shipping email sent:", order.user.email))
    .catch((err) => console.error("Shipping email failed:", err.message));

  res.json(updatedOrder);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page     = Number(req.query.page) || 1;

  const count  = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate("user", "id name")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.deleteOne();
  res.json({ message: "Order removed" });
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderToDelivered,
  getOrders,
  deleteOrder,
};