import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Row, Col, ListGroup, Image, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
} from "../slices/ordersApiSlice";

// PayFast field order — MUST match exactly what the backend signs
// Source: https://developers.payfast.co.za/docs#step_2_signature
const PAYFAST_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "m_payment_id",
  "amount",
  "item_name",
];

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // PayFast session state
  const [payfastData, setPayfastData]       = useState(null);
  const [loadingPayFast, setLoadingPayFast] = useState(false);
  const [payfastError, setPayfastError]     = useState(null);

  // Polling ref — stored in ref so interval can be cleared from inside itself
  const pollIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);
  const MAX_POLL_ATTEMPTS = 8; // 8 × 2.5s = 20 seconds max

  // ── Fetch signed PayFast form data from backend ──────────────────────────
  useEffect(() => {
    if (!order || order.isPaid) return;

    const fetchPayFastSession = async () => {
      setLoadingPayFast(true);
      setPayfastError(null);
      try {
        const res = await fetch("/api/payfast/session", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(order),
        });
        const data = await res.json();
        if (res.ok) {
          setPayfastData(data);
        } else {
          setPayfastError(data.message || "Failed to load payment option");
          toast.error("Failed to load PayFast payment option");
        }
      } catch (err) {
        setPayfastError("Network error — please refresh");
        toast.error("Failed to connect to payment service");
      } finally {
        setLoadingPayFast(false);
      }
    };

    fetchPayFastSession();
  }, [order?._id]); // Only re-run if the order ID changes

  // ── Poll for payment confirmation after returning from PayFast ───────────
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentReturn = urlParams.get("payment");

    if (paymentReturn !== "success" || !order || order.isPaid) return;

    // Clean the URL query param so it doesn't re-trigger on refresh
    navigate(`/order/${orderId}`, { replace: true });

    toast.info("Confirming your payment...");

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      try {
        const res  = await fetch(`/api/payfast/verify/${orderId}`);
        const data = await res.json();
        if (data.isPaid) {
          clearInterval(pollIntervalRef.current);
          refetch();
          toast.success("🎉 Payment confirmed! Thank you for your order.");
        }
      } catch (_) {
        // Silently retry
      }
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(pollIntervalRef.current);
        toast.info(
          "Payment is being processed. Check your email for confirmation or refresh in a moment."
        );
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [order?._id, order?.isPaid, orderId, navigate, refetch]);

  // Handle ?payment=cancelled
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment") === "cancelled") {
      navigate(`/order/${orderId}`, { replace: true });
      toast.warning("Payment was cancelled. You can try again below.");
    }
  }, [orderId, navigate]);

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();
      refetch();
      toast.success("Order marked as delivered");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) return <Loader />;
  if (error) return (
    <Message variant="danger">
      {error?.data?.message || error?.error || "Failed to load order"}
    </Message>
  );

  return (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">

            {/* ── Shipping ── */}
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p><strong>Name: </strong>{order.user.name}</p>
              <p>
                <strong>Email: </strong>
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p><strong>Phone: </strong>{order.shippingAddress.phone}</p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address},{" "}
                {order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString("en-ZA")}
                </Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </ListGroup.Item>

            {/* ── Payment ── */}
            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p><strong>Method: </strong>{order.paymentMethod}</p>
              {order.isPaid ? (
                <Message variant="success">
                  Paid on {new Date(order.paidAt).toLocaleDateString("en-ZA")}
                </Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>

            {/* ── Order Items ── */}
            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                          {item.size && (
                            <span className="text-muted small ms-2">
                              Size: {item.size}
                            </span>
                          )}
                        </Col>
                        <Col md={4}>
                          {item.qty} × R{item.price} = R{(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>

          </ListGroup>
        </Col>

        {/* ── Order Summary + PayFast ── */}
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>R{order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>
                    {Number(order.shippingPrice) === 0
                      ? <span className="text-success fw-bold">FREE</span>
                      : `R${order.shippingPrice}`}
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>VAT (15%)</Col>
                  <Col>R{order.vatPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col><strong>Total</strong></Col>
                  <Col><strong>R{order.totalPrice}</strong></Col>
                </Row>
              </ListGroup.Item>

              {/* ── PayFast Payment Form ── */}
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPayFast ? (
                    <Loader />
                  ) : payfastError ? (
                    <Message variant="danger">{payfastError}</Message>
                  ) : payfastData ? (
                    <div>
                      <p className="mb-1">
                        <strong>Pay securely with PayFast</strong>
                      </p>
                      <p className="text-muted small mb-3">
                        Accepts credit/debit card, EFT &amp; instant EFT
                      </p>

                      {/*
                        PayFast requires a standard HTML form POST.
                        Hidden inputs are rendered in EXACT field order
                        matching the server-signed signature.
                        Signature must be the LAST hidden field.
                      */}
                      <form
                        action={payfastData.payfast_url}
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
                        {/* Signature goes last */}
                        <input
                          type="hidden"
                          name="signature"
                          value={payfastData.signature || ""}
                        />
                        <Button
                          type="submit"
                          className="w-100"
                          style={{
                            backgroundColor: "#00a95c",
                            borderColor:     "#00a95c",
                            fontWeight:      600,
                          }}
                        >
                          🔒 Pay R{order.totalPrice} with PayFast
                        </Button>
                      </form>
                      <p className="text-muted small mt-2 text-center">
                        You'll receive an email confirmation after payment
                      </p>
                    </div>
                  ) : (
                    <Message variant="warning">
                      Payment option unavailable — please refresh the page
                    </Message>
                  )}
                </ListGroup.Item>
              )}

              {/* ── Admin: Mark as Delivered ── */}
              {loadingDeliver && <ListGroup.Item><Loader /></ListGroup.Item>}
              {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="btn btn-block w-100"
                    onClick={deliverOrderHandler}
                    disabled={loadingDeliver}
                  >
                    {loadingDeliver ? "Updating..." : "Mark As Delivered"}
                  </Button>
                </ListGroup.Item>
              )}

            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
