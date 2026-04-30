import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowRight } from "react-icons/fa";
import Message from "../components/Message";
import CheckoutSteps from "../components/CheckoutSteps";
import Loader from "../components/Loader";
import { useCreateOrderMutation } from "../slices/ordersApiSlice";
import { clearCartItems } from "../slices/cartSlice";

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart     = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  // Only guard against missing shipping — payment is always PayFast now
  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems:      cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod:   "PayFast",
        itemsPrice:      cart.itemsPrice,
        shippingPrice:   cart.shippingPrice,
        vatPrice:        cart.vatPrice,
        totalPrice:      cart.totalPrice,
      }).unwrap();

      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 />

      <Row className="g-4" style={{ marginTop: "0.5rem" }}>

        {/* ── Left: order details ── */}
        <Col md={8}>

          {/* Shipping */}
          <div className="placeorder-section">
            <div className="placeorder-section__header">
              <p className="placeorder-section__title">Shipping Address</p>
            </div>
            <div className="placeorder-section__body">
              <p>
                {cart.shippingAddress.address}, {cart.shippingAddress.city},{" "}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
              <p>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                  Phone:
                </span>{" "}
                {cart.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment — informational only */}
          <div className="placeorder-section">
            <div className="placeorder-section__header">
              <p className="placeorder-section__title">Payment</p>
            </div>
            <div className="placeorder-section__body">
              <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                PayFast
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>
                You will be redirected to PayFast to complete payment securely.
              </p>
            </div>
          </div>

          {/* Order items */}
          <div className="placeorder-section">
            <div className="placeorder-section__header">
              <p className="placeorder-section__title">
                Order Items ({cart.cartItems.reduce((a, i) => a + i.qty, 0)})
              </p>
            </div>
            <div className="placeorder-section__body">
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                cart.cartItems.map((item, index) => (
                  <div key={index} className="placeorder-item">
                    <img src={item.image} alt={item.name} className="placeorder-item__image" />
                    <Link to={`/product/${item.product}`} className="placeorder-item__name">
                      {item.name}
                      {item.size && (
                        <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                          Size: {item.size}
                        </span>
                      )}
                    </Link>
                    <span className="placeorder-item__calc">
                      {item.qty} × R{item.price}{" "}
                      <span style={{ color: "var(--meka-green)", fontWeight: 700 }}>
                        = R{(item.qty * item.price).toFixed(2)}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        {/* ── Right: order summary ── */}
        <Col md={4}>
          <div className="order-summary" style={{ position: "sticky", top: "1.5rem" }}>
            <div className="order-summary__header">
              <p className="order-summary__title">Order Summary</p>
            </div>
            <div className="order-summary__body">
              <div className="order-summary__row">
                <span className="order-summary__label">Items</span>
                <span className="order-summary__value">R{cart.itemsPrice}</span>
              </div>
              <div className="order-summary__row">
                <span className="order-summary__label">Shipping</span>
                <span className="order-summary__value">R{cart.shippingPrice}</span>
              </div>
              <div className="order-summary__row">
                <span className="order-summary__label">VAT (15%)</span>
                <span className="order-summary__value">R{cart.vatPrice}</span>
              </div>
            </div>
            <div className="order-summary__total">
              <span className="order-summary__total-label">Total</span>
              <span className="order-summary__total-value">R{cart.totalPrice}</span>
            </div>

            {error && (
              <div style={{ padding: "0 1.25rem" }}>
                <Message variant="danger">{error?.data?.message}</Message>
              </div>
            )}

            <button
              className="place-order-btn"
              disabled={cart.cartItems.length === 0 || isLoading}
              onClick={placeOrderHandler}
            >
              Place Order & Pay <FaArrowRight size={12} style={{ marginLeft: "0.4rem" }} />
            </button>

            {isLoading && <div style={{ padding: "0 1.25rem 1rem" }}><Loader /></div>}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;