import express from "express";
import { generateSignature } from "../utils/payfast.js";  // Use .js extension for ES modules

const router = express.Router();

router.post("/generate-signature", (req, res) => {
  const signature = generateSignature(req.body);
  res.json({ signature });
});

export default router;