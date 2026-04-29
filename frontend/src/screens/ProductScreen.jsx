import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
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
  useDeleteReviewMutation,
} from "../slices/productsApiSlice";

const SIZES = ["S", "M", "L", "XL"];

const ProductScreen = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [size, setSize] = useState("");

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const addToCartHandler = () => {
    if (!size) {
      toast.error("Please select a size before adding to cart.");
      return;
    }
    dispatch(addToCart({ ...product, qty, size }));
    navigate("/cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch();
      setRating(0);
      setComment("");
      toast.success("Review submitted");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!userInfo?.isAdmin) {
      toast.error("Not authorized to delete reviews.");
      return;
    }
    try {
      await deleteReview({ productId, reviewId }).unwrap();
      refetch();
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/home" className="product-screen__back">
        <FaArrowLeft size={11} /> Back to Products
      </Link>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error?.data?.message || error.error}</Message>
      ) : (
        <>
          <Meta title={product.name} />

          {/* ── Main product layout ── */}
          <Row className="g-4">

            {/* Image */}
            <Col md={5}>
              <img
                src={product.image}
                alt={product.name}
                className="product-screen__image"
              />
            </Col>

            {/* Details */}
            <Col md={4}>
              <h1 className="product-screen__name">{product.name}</h1>

              <Rating
                value={product.rating}
                text={`${product.numReviews} reviews`}
              />

              <p className="product-screen__price">R{product.price}</p>

              {/* Green accent bar */}
              <div style={{
                width: "36px",
                height: "3px",
                backgroundColor: "var(--meka-green)",
                borderRadius: "999px",
                margin: "0.75rem 0 1rem",
              }} />

              <p className="product-screen__description">
                {product.description}
              </p>
            </Col>

            {/* Purchase box */}
            <Col md={3}>
              <div className="purchase-box">

                {/* Price row */}
                <div className="purchase-box__row">
                  <span className="purchase-box__label">Price</span>
                  <span className="purchase-box__value">R{product.price}</span>
                </div>

                {/* Stock row */}
                <div className="purchase-box__row">
                  <span className="purchase-box__label">Status</span>
                  <span className={`purchase-box__value ${product.countInStock > 0 ? "in-stock" : "out-of-stock"}`}>
                    {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {product.countInStock > 0 && (
                  <>
                    {/* Size selector */}
                    <div className="purchase-box__row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.6rem" }}>
                      <span className="purchase-box__label">Size</span>
                      <div className="size-selector">
                        {SIZES.map((s) => (
                          <button
                            key={s}
                            className={`size-btn${size === s ? " selected" : ""}`}
                            onClick={() => setSize(s)}
                            type="button"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="purchase-box__row">
                      <span className="purchase-box__label">Qty</span>
                      <Form.Select
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        style={{ width: "80px", fontSize: "0.9rem" }}
                      >
                        {[...Array(product.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </Form.Select>
                    </div>

                    {/* Add to cart */}
                    <button
                      className="add-to-cart-btn"
                      type="button"
                      disabled={product.countInStock === 0}
                      onClick={addToCartHandler}
                    >
                      Add to Cart
                    </button>
                  </>
                )}
              </div>
            </Col>
          </Row>

          {/* ── Reviews ── */}
          <Row className="reviews-section">
            <Col md={7}>

              {/* Existing reviews */}
              <h2 className="reviews-section__title">Reviews</h2>

              {product.reviews.length === 0 ? (
                <Message>No reviews yet — be the first!</Message>
              ) : (
                product.reviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div style={{ flex: 1 }}>
                      <p className="review-item__name">{review.name}</p>
                      <Rating value={review.rating} />
                      <p className="review-item__date">
                        {review.createdAt.substring(0, 10)}
                      </p>
                      <p className="review-item__comment">{review.comment}</p>
                    </div>
                    {userInfo?.isAdmin && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--bs-danger)",
                          cursor: "pointer",
                          padding: "0.25rem",
                          marginLeft: "0.75rem",
                          flexShrink: 0,
                          opacity: 0.7,
                          transition: "opacity 0.15s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                      >
                        <FaTrash size={13} />
                      </button>
                    )}
                  </div>
                ))
              )}

              {/* Write a review */}
              <div style={{ marginTop: "2rem" }}>
                <h3 className="write-review__title">Write a Review</h3>

                {loadingProductReview && <Loader />}

                {userInfo ? (
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

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loadingProductReview}
                    >
                      Submit Review
                    </Button>
                  </Form>
                ) : (
                  <Message>
                    Please <Link to="/login">sign in</Link> to write a review.
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