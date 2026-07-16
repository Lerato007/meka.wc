import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { sendOrderShippedEmail } from "../utils/emailService.js";

// Statuses a customer is still allowed to self-cancel from.
// Once an order is Packed/Dispatched/Delivered it's too far along for self-service cancellation.
const CUSTOMER_CANCELLABLE_STATUSES = ["Processing", "Confirmed"];

// Restore per-size (or flat) stock for every item in an order.
// Used whenever an order transitions into "Cancelled" so reserved stock isn't lost forever.
const restoreStockForOrder = async (order) => {
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue; // product may have been deleted since order was placed

    if (item.size && product.sizeStock) {
      product.sizeStock[item.size] = (product.sizeStock[item.size] || 0) + item.qty;
      // pre-save hook syncs countInStock automatically
    } else {
      product.countInStock = (product.countInStock || 0) + item.qty;
    }
    await product.save();
  }
};

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

    // Check if sizeStock has been configured (any size > 0)
    const hasSizeStock = product.sizeStock &&
      Object.values(product.sizeStock).some((v) => v > 0);

    if (hasSizeStock && size) {
      // Use per-size stock
      const availableStock = product.sizeStock[size] || 0;
      if (qty > availableStock) {
        stockErrors.push(
          `${product.name} (${size}) — only ${availableStock} left in stock, you requested ${qty}`
        );
      }
    } else {
      // Fall back to flat countInStock
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

  const previousStatus = order.status;

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

  // Restore reserved stock when an order is cancelled — but only once,
  // in case this endpoint is somehow called twice on an already-cancelled order.
  if (status === "Cancelled" && previousStatus !== "Cancelled") {
    await restoreStockForOrder(order);
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

// @desc    Cancel own order (customer self-service)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Only the order's owner (or an admin) can cancel it
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized to cancel this order");
  }

  if (order.status === "Cancelled") {
    res.status(400);
    throw new Error("This order is already cancelled");
  }

  if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
    res.status(400);
    throw new Error(
      `This order can no longer be cancelled — it's already ${order.status.toLowerCase()}. Please contact support.`
    );
  }

  await restoreStockForOrder(order);

  order.status = "Cancelled";
  order.statusHistory.push({
    status:    "Cancelled",
    note:      req.body.reason || "Cancelled by customer",
    updatedBy: req.user.isAdmin && req.user._id.toString() !== order.user._id.toString()
      ? req.user.name
      : order.user.name,
  });

  const updatedOrder = await order.save();
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
  cancelOrder,
  updateOrderToDelivered,
  getOrders,
  deleteOrder,
};