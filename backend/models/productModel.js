import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name:   { type: String, required: true },
    rating: { type: Number, required: true },
    comment:{ type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name:        { type: String, required: true },
    // Primary image (backwards compatible)
    image:       { type: String, required: true },
    // Additional images for gallery
    images:      [{ type: String }],
    brand:       { type: String, required: true },
    category:    { type: String, required: true },
    description: { type: String, required: true },
    reviews:     [reviewSchema],
    rating:      { type: Number, required: true, default: 0 },
    numReviews:  { type: Number, required: true, default: 0 },
    price:       { type: Number, required: true, default: 0 },
    // Legacy total stock — kept for backwards compatibility
    countInStock:{ type: Number, required: true, default: 0 },
    // Per-size stock — e.g. { S: 3, M: 5, L: 0, XL: 2 }
    sizeStock: {
      S:  { type: Number, default: 0 },
      M:  { type: Number, default: 0 },
      L:  { type: Number, default: 0 },
      XL: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Keep countInStock in sync with sum of sizeStock before save
productSchema.pre("save", function (next) {
  if (this.sizeStock) {
    this.countInStock =
      (this.sizeStock.S  || 0) +
      (this.sizeStock.M  || 0) +
      (this.sizeStock.L  || 0) +
      (this.sizeStock.XL || 0);
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;