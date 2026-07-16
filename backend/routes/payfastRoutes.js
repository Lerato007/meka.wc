import express from "express";
import { createOnsiteIdentifier, handleItn } from "../controllers/payfastController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/onsite/:orderId", protect, createOnsiteIdentifier);
router.post("/notify", handleItn); // Public — called by PayFast's servers, no auth

export default router;