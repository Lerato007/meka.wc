import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToDelivered,
  getOrders,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);
router.route("/mine").get(protect, getMyOrders);
router.route("/:id").get(protect, getOrderById).delete(protect, admin, deleteOrder);
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

// NOTE: /:id/pay (PayPal) has been removed.
// Payment is now handled entirely by PayFast via the ITN webhook
// at POST /api/payfast/notify — no manual pay route needed.

export default router;