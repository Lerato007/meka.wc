import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  FaCheckCircle, FaTimesCircle,
  FaTruck, FaClock, FaCreditCard,
} from "react-icons/fa";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
  useGetPayFastIdentifierMutation,
  usePayOrderMutation,
} from "../slices/ordersApiSlice";

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [deliverOrder,         { isLoading: loadingDeliver }]  = useDeliverOrderMutation();
  const [getPayFastIdentifier, { isLoading: loadingIdentifier }] = useGetPayFastIdentifierMutation();
  const [payOrder,             { isLoading: loadingPay }]      = usePayOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);

  // Prevent double-firing the modal if React renders twice (StrictMode)
  const modalOpenRef = useRef(false);

  const [paymentError, setPaymentError] = useState(null);

  // ── Trigger PayFast modal ──────────────────────────────────────────────────
  const handlePayment = async () => {
    if (modalOpenRef.current) return;
    setPaymentError(null);

    try {
      // Step 1 result: get the UUID from our backend
      const { uuid } = await getPayFastIdentifier(orderId).unwrap();

      if (!uuid) {
        setPaymentError("Could not initiate payment. Please try again.");
        return;
      }

      // Step 2: trigger the PayFast onsite modal (Method 2 — with callback)
      if (typeof window.payfast_do_onsite_payment !== "function") {
        setPaymentError("PayFast payment engine failed to load. Please refresh and try again.");
        return;
      }

      modalOpenRef.current = true;

      window.payfast_do_onsite_payment(
        {
          uuid,
          // return_url and cancel_url were NOT set in Step 1,
          // so we supply them here as the fallback.
          return_url: `${window.location.origin}/order/${orderId}`,
          cancel_url: `${window.location.origin}/order/${orderId}`,
        },
        async (result) => {
          modalOpenRef.current = false;

          if (result === true) {
            // Payment completed — mark order as paid in our DB
            try {
              await payOrder({
                orderId,
                details: {
                  id:            uuid,
                  status:        "COMPLETE",
                  update_time:   new Date().toISOString(),
                  email_address: order?.user?.email || "",
                },
              }).unwrap();

              refetch();
              toast.success("Payment successful! Your order is confirmed.");
            } catch (payErr) {
              toast.error(payErr?.data?.message || "Payment recorded but order update failed. Please contact support.");
            }
          } else {
            // User closed the modal without paying
            toast.info("Payment cancelled. You can try again whenever you're ready.");
          }
        }
      );
    } catch (err) {
      modalOpenRef.current = false;
      setPaymentError(err?.data?.message || err.message || "Payment initiation failed.");
    }
  };

  // ── Deliver handler ────────────────────────────────────────────────────────
  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success("Order marked as delivered");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  );

  const isPaymentPending = !order.isPaid;
  const isBusy = loadingIdentifier || loadingPay;

  return (
    <>
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
              {[
                ["Name",    order.user.name],
                ["Email",   <a href={`mailto:${order.user.email}`} style={{ color: "var(--meka-green)" }}>{order.user.email}</a>],
                ["Phone",   order.shippingAddress.phone],
                ["Address", `${order.shippingAddress.address}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`],
              ].map(([label, value]) => (
                <p key={label}>
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}:
                  </span>{" "}{value}
                </p>
              ))}

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
                </span>{" "}{order.paymentMethod}
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
              ) : order.orderItems.map((item, index) => (
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
              ))}
            </div>
          </div>
        </Col>

        {/* ── Right: summary ── */}
        <Col md={4}>
          <div className="order-summary" style={{ position: "sticky", top: "1.5rem" }}>

            <div className="order-summary__header">
              <p className="order-summary__title">Order Summary</p>
            </div>

            <div className="order-summary__body">
              {[
                ["Items",     `R${order.itemsPrice}`],
                ["Shipping",  `R${order.shippingPrice}`],
                ["VAT (15%)", `R${order.vatPrice}`],
              ].map(([label, value]) => (
                <div key={label} className="order-summary__row">
                  <span className="order-summary__label">{label}</span>
                  <span className="order-summary__value">{value}</span>
                </div>
              ))}
            </div>

            <div className="order-summary__total">
              <span className="order-summary__total-label">Total</span>
              <span className="order-summary__total-value">R{order.totalPrice}</span>
            </div>

            {/* Payment area */}
            <div style={{ padding: "0 1.25rem 1.25rem" }}>
              {order.isPaid ? (
                <div style={{
                  background: "rgba(64,145,24,0.08)",
                  border: "1.5px solid var(--meka-green-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  color: "var(--meka-green-dark)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.88rem",
                }}>
                  <FaCheckCircle style={{ flexShrink: 0 }} />
                  Payment received. Thank you!
                </div>
              ) : (
                <>
                  {paymentError && (
                    <Message variant="danger" style={{ marginBottom: "0.75rem" }}>
                      {paymentError}
                    </Message>
                  )}

                  {isBusy ? (
                    <Loader />
                  ) : (
                    <button
                      className="place-order-btn"
                      onClick={handlePayment}
                      disabled={isBusy}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                    >
                      <FaCreditCard size={14} />
                      Pay Now — R{order.totalPrice}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Admin: mark as delivered */}
            {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
              <>
                {loadingDeliver && <div style={{ padding: "0 1.25rem" }}><Loader size="sm" /></div>}
                <button
                  className="deliver-btn"
                  onClick={deliverHandler}
                  disabled={loadingDeliver}
                >
                  {loadingDeliver ? "Updating…" : "Mark as Delivered"}
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
