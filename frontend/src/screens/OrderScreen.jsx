import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaTimesCircle, FaTruck, FaClock } from "react-icons/fa";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
} from "../slices/ordersApiSlice";

const PAYFAST_FIELD_ORDER = [
  "merchant_id", "merchant_key", "return_url", "cancel_url",
  "notify_url", "name_first", "email_address",
  "m_payment_id", "amount", "item_name",
];

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [payfastData,    setPayfastData]    = useState(null);
  const [loadingPayFast, setLoadingPayFast] = useState(false);

  // ── Fetch PayFast session ──
  useEffect(() => {
    if (!order?._id || order.isPaid) return;

    const fetchPayFastData = async () => {
      setLoadingPayFast(true);
      try {
        const res = await fetch("/api/payfast/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        const data = await res.json();
        if (res.ok) {
          setPayfastData(data);
        } else {
          toast.error("Failed to load payment option");
        }
      } catch (err) {
        toast.error("Failed to load payment option");
      } finally {
        setLoadingPayFast(false);
      }
    };

    fetchPayFastData();
  }, [order]);

  // ── Verify PayFast payment on return ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") !== "success" || !order || order.isPaid) return;

    let attempts = 0;
    const maxAttempts = 24; // poll for up to 60s

    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payfast/verify/${order._id}`);
        const data = await res.json();
        if (data?.order?.isPaid) {
          clearInterval(poll);
          refetch();
          toast.success("Payment confirmed!");
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          toast.info("Payment is being processed — check back shortly.");
        }
      } catch {
        clearInterval(poll);
        toast.error("Could not verify payment.");
      }
    }, 2500);

    return () => clearInterval(poll);
  }, [order, refetch]);

  // ── Deliver handler ──
  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success("Order marked as delivered");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message || error.error}</Message>;

  return (
    <>
      {/* Page header */}
      <p className="order-screen__id">Order Confirmation</p>
      <h1 className="order-screen__title">#{order._id}</h1>
      <div className="order-screen__accent" />

      <Row className="g-4">

        {/* ── Left: order details ── */}
        <Col md={8}>

          {/* Shipping */}
          <div className="placeorder-section">
            <div className="placeorder-section__header">
              <p className="placeorder-section__title">Shipping Details</p>
            </div>
            <div className="placeorder-section__body">
              <p>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Name:
                </span>{" "}
                {order.user.name}
              </p>
              <p>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Email:
                </span>{" "}
                <a href={`mailto:${order.user.email}`} style={{ color: "var(--meka-green)" }}>
                  {order.user.email}
                </a>
              </p>
              <p>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Phone:
                </span>{" "}
                {order.shippingAddress.phone}
              </p>
              <p>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Address:
                </span>{" "}
                {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>

              {order.isDelivered ? (
                <span className="status-pill delivered">
                  <FaTruck size={11} /> Delivered {order.deliveredAt?.substring(0, 10)}
                </span>
              ) : (
                <span className="status-pill not-delivered">
                  <FaClock size={11} /> Not yet delivered
                </span>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="placeorder-section">
            <div className="placeorder-section__header">
              <p className="placeorder-section__title">Payment</p>
            </div>
            <div className="placeorder-section__body">
              <p>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Method:
                </span>{" "}
                {order.paymentMethod}
              </p>

              {order.isPaid ? (
                <span className="status-pill paid">
                  <FaCheckCircle size={11} /> Paid {order.paidAt?.substring(0, 10)}
                </span>
              ) : (
                <span className="status-pill unpaid">
                  <FaTimesCircle size={11} /> Awaiting payment
                </span>
              )}
            </div>
          </div>

          {/* Order items */}
          <div className="placeorder-section">
            <div className="placeorder-section__header">
              <p className="placeorder-section__title">
                Order Items ({order.orderItems.reduce((a, i) => a + i.qty, 0)})
              </p>
            </div>
            <div className="placeorder-section__body">
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                order.orderItems.map((item, index) => (
                  <div key={index} className="placeorder-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="placeorder-item__image"
                    />
                    <Link
                      to={`/product/${item.product}`}
                      className="placeorder-item__name"
                    >
                      {item.name}
                      {item.size && (
                        <span style={{
                          display: "block",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          fontWeight: 400,
                          color: "var(--text-muted)",
                          textTransform: "none",
                          letterSpacing: 0,
                        }}>
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

        {/* ── Right: summary + payment ── */}
        <Col md={4}>
          <div className="order-summary" style={{ position: "sticky", top: "1.5rem" }}>

            <div className="order-summary__header">
              <p className="order-summary__title">Order Summary</p>
            </div>

            <div className="order-summary__body">
              <div className="order-summary__row">
                <span className="order-summary__label">Items</span>
                <span className="order-summary__value">R{order.itemsPrice}</span>
              </div>
              <div className="order-summary__row">
                <span className="order-summary__label">Shipping</span>
                <span className="order-summary__value">R{order.shippingPrice}</span>
              </div>
              <div className="order-summary__row">
                <span className="order-summary__label">VAT (15%)</span>
                <span className="order-summary__value">R{order.vatPrice}</span>
              </div>
            </div>

            <div className="order-summary__total">
              <span className="order-summary__total-label">Total</span>
              <span className="order-summary__total-value">R{order.totalPrice}</span>
            </div>

            {/* PayFast payment form */}
            {!order.isPaid && (
              <div style={{ padding: "0 1.25rem 1.25rem" }}>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                }}>
                  Complete Payment
                </p>

                {loadingPayFast ? (
                  <Loader />
                ) : payfastData ? (
                  <>
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      marginBottom: "0.75rem",
                    }}>
                      You will be charged R{order.totalPrice} via PayFast
                    </p>
                    <form
                      action="https://sandbox.payfast.co.za/eng/process"
                      method="POST"
                    >
                      {PAYFAST_FIELD_ORDER.map((key) => (
                        <input
                          key={key}
                          type="hidden"
                          name={key}
                          value={payfastData[key] || ""}
                        />
                      ))}
                      <input
                        type="hidden"
                        name="signature"
                        value={payfastData.signature || ""}
                      />
                      <button type="submit" className="payfast-btn">
                        Pay Now — R{order.totalPrice}
                      </button>
                    </form>
                  </>
                ) : (
                  <Message variant="warning">
                    Payment option unavailable. Please refresh the page.
                  </Message>
                )}
              </div>
            )}

            {/* Admin: mark delivered */}
            {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
              <>
                {loadingDeliver && <div style={{ padding: "0 1.25rem" }}><Loader /></div>}
                <button
                  className="deliver-btn"
                  onClick={deliverOrderHandler}
                  disabled={loadingDeliver}
                >
                  Mark as Delivered
                </button>
              </>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;