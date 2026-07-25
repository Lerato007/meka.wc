import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Row, Col, Form } from "react-bootstrap";
import { FaArrowLeft, FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Rating from "../components/Rating";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta";
import { addToCart } from "../slices/cartSlice";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useCheckCanReviewQuery,
  useDeleteReviewMutation,
} from "../slices/productsApiSlice";
import {
  useCheckWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "../slices/wishlistApiSlice";

const SIZES = ["S", "M", "L", "XL"];

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [size,          setSize]          = useState("");
  const [qty,           setQty]           = useState(1);
  const [rating,        setRating]        = useState(0);
  const [comment,       setComment]       = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const [createReview, { isLoading: loadingReview }] = useCreateReviewMutation();
  const [deleteReview]                               = useDeleteReviewMutation();
  const { data: canReviewData, isLoading: canReviewLoading } = useCheckCanReviewQuery(
    productId,
    { skip: !userInfo, refetchOnMountOrArgChange: true }
  );

  const { data: wishlistStatus } = useCheckWishlistQuery(productId, { skip: !userInfo });
  const [addToWishlist,      { isLoading: addingWishlist }]   = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removingWishlist }] = useRemoveFromWishlistMutation();

  const isWishlisted = wishlistStatus?.isWishlisted || false;

  // All images: primary + gallery extras
  const allImages = product
    ? [product.image, ...(product.images || []).filter((img) => img !== product.image)]
    : [];

  // Get stock for a given size
  const hasSizeStock = product
  ? Object.values(product.sizeStock || {}).some((v) => v > 0)
  : false;

const sizeStockAvailable = (sz) => {
  if (!product) return 0;
  // If sizeStock has been configured (any size > 0), use per-size stock
  if (hasSizeStock) return product.sizeStock?.[sz] || 0;
  // Otherwise fall back to flat countInStock — all sizes available
  return product.countInStock || 0;
};

  const selectedSizeStock = size ? sizeStockAvailable(size) : 0;

  const addToCartHandler = () => {
    if (!size) { toast.error("Please select a size"); return; }
    if (qty > selectedSizeStock) { toast.error(`Only ${selectedSizeStock} left in size ${size}`); return; }
    dispatch(addToCart({ ...product, qty, size }));
    navigate("/cart");
  };

  const wishlistHandler = async () => {
    if (!userInfo) { toast.error("Please sign in to save items"); return; }
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(productId).unwrap();
        toast.success("Added to wishlist");
      }
    } catch { toast.error("Could not update wishlist"); }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      setRating(0);
      setComment("");
      toast.success("Review submitted");
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!userInfo?.isAdmin) return;
    try {
      await deleteReview({ productId, reviewId }).unwrap();
      refetch();
      toast.success("Review deleted");
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="product-screen__back"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <FaArrowLeft size={11} /> Back to Products
      </button>

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Meta title={product.name} />

          <Row className="g-4">

            {/* ── Image gallery ── */}
            <Col md={5}>
              <div style={{
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                backgroundColor: "var(--bg-surface)",
                marginBottom: "0.75rem",
                aspectRatio: "3/4",
              }}>
                <img
                  src={allImages[selectedImage] || product.image}
                  alt={product.name}
                  className="product-screen__image"
                  style={{ height: "100%", objectFit: "cover" }}
                />
              </div>

              {allImages.length > 1 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        width: "64px", height: "64px",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        border: selectedImage === index
                          ? "2px solid var(--meka-green)"
                          : "2px solid var(--border-subtle)",
                        padding: 0, cursor: "pointer",
                        background: "none",
                        transition: "border-color 0.15s ease",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={img}
                        alt={`View ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </Col>

            {/* ── Product details ── */}
            <Col md={4}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <h1 className="product-screen__name">{product.name}</h1>
                <button
                  onClick={wishlistHandler}
                  disabled={addingWishlist || removingWishlist}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: isWishlisted ? "#e74c3c" : "var(--text-muted)",
                    fontSize: "1.4rem", padding: "0.25rem",
                    flexShrink: 0, marginTop: "0.25rem",
                    transition: "color 0.15s ease",
                  }}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              <Rating value={product.rating} text={`${product.numReviews} reviews`} />
              <p className="product-screen__price">R{product.price}</p>
              <div style={{ width: "36px", height: "3px", backgroundColor: "var(--meka-green)", borderRadius: "999px", margin: "0.75rem 0 1rem" }} />
              <p className="product-screen__description">{product.description}</p>
            </Col>

            {/* ── Purchase box ── */}
            <Col md={3}>
              <div className="purchase-box">
                <div className="purchase-box__row">
                  <span className="purchase-box__label">Price</span>
                  <span className="purchase-box__value">R{product.price}</span>
                </div>
                <div className="purchase-box__row">
                  <span className="purchase-box__label">Status</span>
                  <span className={`purchase-box__value ${product.countInStock > 0 ? "in-stock" : "out-of-stock"}`}>
                    {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {product.countInStock > 0 && (
                  <>
                    <div className="purchase-box__row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.6rem" }}>
                      <span className="purchase-box__label">Size</span>
                      <div className="size-selector">
                        {SIZES.map((s) => {
                          const stock      = sizeStockAvailable(s);
                          const outOfStock = stock === 0;
                          return (
                            <button
                              key={s}
                              className={`size-btn${size === s ? " selected" : ""}`}
                              onClick={() => { if (!outOfStock) { setSize(s); setQty(1); } }}
                              type="button"
                              disabled={outOfStock}
                              title={outOfStock ? "Out of stock" : `${stock} available`}
                              style={{
                                opacity: outOfStock ? 0.35 : 1,
                                cursor:  outOfStock ? "not-allowed" : "pointer",
                                textDecoration: outOfStock ? "line-through" : "none",
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      {size && (
                        <p style={{
                          fontFamily: "var(--font-body)", fontSize: "0.75rem", margin: 0,
                          color: selectedSizeStock <= 3 ? "#e74c3c" : "var(--text-muted)",
                        }}>
                          {selectedSizeStock <= 3
                            ? `Only ${selectedSizeStock} left!`
                            : `${selectedSizeStock} available`}
                        </p>
                      )}
                    </div>

                    {size && selectedSizeStock > 0 && (
                      <div className="purchase-box__row">
                        <span className="purchase-box__label">Qty</span>
                        <Form.Select
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                          style={{ width: "80px", fontSize: "0.9rem" }}
                        >
                          {[...Array(Math.min(selectedSizeStock, 10)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                          ))}
                        </Form.Select>
                      </div>
                    )}

                    <button
                      className="add-to-cart-btn"
                      type="button"
                      disabled={!size || selectedSizeStock === 0}
                      onClick={addToCartHandler}
                    >
                      {!size ? "Select a Size" : "Add to Cart"}
                    </button>
                  </>
                )}
              </div>
            </Col>
          </Row>

          <Row className="reviews-section">
            <Col md={7}>
              <h2 className="reviews-section__title">Reviews</h2>

              {product.reviews.length === 0 ? (
                <Message>No reviews yet — be the first!</Message>
              ) : (
                product.reviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div style={{ flex: 1 }}>
                      <p className="review-item__name">{review.name}</p>
                      <Rating value={review.rating} />
                      <p className="review-item__date">{review.createdAt.substring(0, 10)}</p>
                      <p className="review-item__comment">{review.comment}</p>
                    </div>
                    {userInfo?.isAdmin && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        style={{
                          background: "none", border: "none",
                          color: "var(--bs-danger)", cursor: "pointer",
                          padding: "0.25rem", marginLeft: "0.75rem",
                          flexShrink: 0, opacity: 0.7,
                        }}
                      >
                        <FaTrash size={13} />
                      </button>
                    )}
                  </div>
                ))
              )}

              <div style={{ marginTop: "2rem" }}>
                <h3 className="write-review__title">Write a Review</h3>

                {!userInfo ? (
                  <Message>
                    Please <Link to="/login">sign in</Link> to write a review.
                  </Message>
                ) : canReviewLoading ? (
                  <Loader />
                ) : canReviewData?.reason === "already_reviewed" ? (
                  <Message>You've already reviewed this product.</Message>
                ) : canReviewData?.canReview ? (
                  <>
                    {loadingReview && <Loader />}
                    <Form onSubmit={submitHandler}>
                      <Form.Group controlId="rating" className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <Form.Select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          <option value="">Select rating...</option>
                          <option value="1">1 — Poor</option>
                          <option value="2">2 — Fair</option>
                          <option value="3">3 — Good</option>
                          <option value="4">4 — Very Good</option>
                          <option value="5">5 — Excellent</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group controlId="comment" className="mb-3">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts on this product..."
                        />
                      </Form.Group>
                      <button
                        type="submit"
                        className="auth-submit-btn"
                        style={{ width: "auto", padding: "0.7rem 1.75rem" }}
                      >
                        Submit Review
                      </button>
                    </Form>
                  </>
                ) : (
                  <Message>
                    Only customers who've purchased this product can leave a review.
                  </Message>
                )}
              </div>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;