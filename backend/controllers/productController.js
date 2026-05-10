import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 8;
  const page     = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  const count    = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) return res.json(product);
  res.status(404);
  throw new Error("Product not found");
});

// @desc    Create a product (admin draft)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name:         "Sample name",
    price:        0,
    user:         req.user._id,
    image:        "/images/sample.jpg",
    images:       [],
    brand:        "Sample brand",
    category:     "Sample category",
    countInStock: 0,
    sizeStock:    { S: 0, M: 0, L: 0, XL: 0 },
    numReviews:   0,
    description:  "Sample description",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name, price, description, image, images,
    brand, category, countInStock, sizeStock,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.name        = name;
  product.price       = price;
  product.description = description;
  product.image       = image;
  product.images      = images || product.images;
  product.brand       = brand;
  product.category    = category;

  // If sizeStock provided use it; otherwise use flat countInStock
  if (sizeStock) {
    product.sizeStock = sizeStock;
    // pre-save hook recalculates countInStock automatically
  } else {
    product.countInStock = countInStock;
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await Product.deleteOne({ _id: product._id });
  res.status(200).json({ message: "Product deleted" });
});

// @desc    Create a review — verified purchasers only
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // ── Verified purchase check ──────────────────────────────────────
  const hasPurchased = await Order.findOne({
    user:      req.user._id,
    isPaid:    true,
    "orderItems.product": product._id,
  });

  if (!hasPurchased) {
    res.status(403);
    throw new Error("You can only review products you have purchased and paid for");
  }

  // ── Duplicate review check ───────────────────────────────────────
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = {
    name:    req.user.name,
    rating:  Number(rating),
    comment,
    user:    req.user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;

  await product.save();
  res.status(201).json({ message: "Review added" });
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteProductReview = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.reviews   = product.reviews.filter((r) => r._id.toString() !== reviewId);
  product.numReviews = product.reviews.length;
  product.rating    = product.reviews.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

  await product.save();
  res.status(200).json({ message: "Review deleted" });
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(9);
  res.status(200).json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteProductReview,
  getTopProducts,
};