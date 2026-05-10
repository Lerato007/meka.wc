import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get("/", protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "name image images price countInStock sizeStock rating numReviews"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user.wishlist);
}));

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
router.post("/:productId", protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findById(req.user._id);

  const alreadyInWishlist = user.wishlist.some(
    (id) => id.toString() === productId
  );

  if (alreadyInWishlist) {
    return res.status(200).json({ message: "Already in wishlist" });
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(201).json({ message: "Added to wishlist" });
}));

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete("/:productId", protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );

  await user.save();
  res.json({ message: "Removed from wishlist" });
}));

export default router;