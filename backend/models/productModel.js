import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name:    { type: String, required: true },
    rating:  { type: Number, required: true },
    comment: { type: String, required: true },
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
    name:         { type: String, required: true },
    image:        { type: String, required: true },
    images:       [{ type: String }],
    brand:        { type: String, required: true },
    category:     { type: String, required: true },
    description:  { type: String, required: true },
    reviews:      [reviewSchema],
    rating:       { type: Number, required: true, default: 0 },
    numReviews:   { type: Number, required: true, default: 0 },
    price:        { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    // Per-size stock — only used when explicitly configured
    sizeStock: {
      S:  { type: Number, default: 0 },
      M:  { type: Number, default: 0 },
      L:  { type: Number, default: 0 },
      XL: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Only sync countInStock from sizeStock when sizeStock has been
// deliberately configured (at least one size > 0).
// This prevents the hook from zeroing out countInStock on products
// that haven't had per-size stock set up yet.
productSchema.pre("save", function (next) {
  if (this.sizeStock) {
    const total =
      (this.sizeStock.S  || 0) +
      (this.sizeStock.M  || 0) +
      (this.sizeStock.L  || 0) +
      (this.sizeStock.XL || 0);

    // Only override countInStock if sizeStock is actually being used
    if (total > 0) {
      this.countInStock = total;
    }
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;