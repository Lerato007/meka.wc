import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash, FaArrowRight } from "react-icons/fa";
import Message from "../components/Message";
import { addToCart, removeFromCart } from "../slices/cartSlice";

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cartItems
    .reduce((acc, item) => acc + item.qty * item.price, 0)
    .toFixed(2);

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  return (
    <Row className="g-4">
      {/* ── Cart items ── */}
      <Col md={8}>
        <h1 className="cart-page__title">Shopping Cart</h1>
        <div className="cart-page__accent" />

        {cartItems.length === 0 ? (
          <Message>
            Your cart is empty.{" "}
            <Link to="/home" style={{ color: "var(--meka-green)", fontWeight: 600 }}>
              Continue Shopping
            </Link>
          </Message>
        ) : (
          <div>
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">

                {/* Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item__image"
                />

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/product/${item._id}`}
                    className="cart-item__name"
                  >
                    {item.name}
                  </Link>
                  {item.size && (
                    <p className="cart-item__meta">Size: {item.size}</p>
                  )}
                </div>

                {/* Price */}
                <span className="cart-item__price">R{item.price}</span>

                {/* Qty */}
                <Form.Select
                  value={item.qty}
                  onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                  className="cart-item__qty"
                  size="sm"
                >
                  {[...Array(item.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </Form.Select>

                {/* Remove */}
                <button
                  className="cart-item__remove"
                  onClick={() => removeFromCartHandler(item._id)}
                  title="Remove item"
                >
                  <FaTrash size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Col>

      {/* ── Order summary ── */}
      <Col md={4}>
        <div className="order-summary">
          <div className="order-summary__header">
            <p className="order-summary__title">Order Summary</p>
          </div>

          <div className="order-summary__body">
            <div className="order-summary__row">
              <span className="order-summary__label">
                Items ({totalItems})
              </span>
              <span className="order-summary__value">R{subtotal}</span>
            </div>
            <div className="order-summary__row">
              <span className="order-summary__label">Shipping</span>
              <span className="order-summary__value"
                style={{ color: "var(--meka-green)", fontSize: "0.85rem" }}>
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="order-summary__total">
            <span className="order-summary__total-label">Subtotal</span>
            <span className="order-summary__total-value">R{subtotal}</span>
          </div>

          <button
            className="checkout-btn"
            disabled={cartItems.length === 0}
            onClick={checkoutHandler}
          >
            Proceed to Checkout <FaArrowRight size={12} style={{ marginLeft: "0.4rem" }} />
          </button>
        </div>
      </Col>
    </Row>
  );
};

export default CartScreen;