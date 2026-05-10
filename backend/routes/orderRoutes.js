import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
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
router.route("/:id/status").put(protect, admin, updateOrderStatus);

export default router;