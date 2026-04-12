import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, ListGroup, Image, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { PayPalButtons, FUNDING, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from "axios";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { useGetOrderDetailsQuery, usePayOrderMutation, useDeliverOrderMutation, useGetPayPalClientIdQuery } from "../slices/ordersApiSlice";

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const { data: paypal, isLoading: loadingPayPal, error: errorPayPal } = useGetPayPalClientIdQuery();

  // PayFast state
  const [payfastData, setPayfastData] = useState(null);
  const [loadingPayFast, setLoadingPayFast] = useState(false);

  const payfastFieldOrder = [
    "merchant_id",
    "merchant_key",
    "return_url",
    "cancel_url",
    "notify_url",
    "name_first",
    "email_address",
    "m_payment_id",
    "amount",
    "item_name",
  ];

  // Fetch PayFast session
  useEffect(() => {
    const fetchPayFastData = async () => {
      if (order?._id && !order.isPaid) {
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
            console.error("PayFast error:", data);
            toast.error("Failed to load PayFast payment option");
          }
        } catch (err) {
          console.error("Fetch failed:", err);
          toast.error("Failed to load PayFast payment option");
        } finally {
          setLoadingPayFast(false);
        }
      }
    };
    fetchPayFastData();
  }, [order]);

  // Verify PayFast payment after return
  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentReturn = urlParams.get("payment");

  if (paymentReturn === "success" && order && !order.isPaid) {
    const verifyPayment = async () => {
      try {
        const res = await axios.post(`/api/payfast/verify/${order._id}`);
        if (res.data.order.isPaid) {
          refetch();
          toast.success("Payment Successful via PayFast");
        } else {
          toast.info("Payment not confirmed yet, please wait a moment.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to verify PayFast payment");
      }
    };
    verifyPayment();
  }
}, [order, refetch]);


  // PayPal script loader
  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal?.clientId) {
      paypalDispatch({ type: "resetOptions", value: { "client-id": paypal.clientId, currency: "USD", locale: "en_ZA" } });
      paypalDispatch({ type: "setLoadingStatus", value: "pending" });
    }
  }, [order, paypal, paypalDispatch, loadingPayPal, errorPayPal]);

  // PayPal handlers
  const onApprove = async (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        await payOrder({ orderId, details }).unwrap();
        refetch();
        toast.success("Payment Successful");
      } catch (err) {
        toast.error(err?.data?.message || err.message);
      }
    });
  };

  const onError = (err) => toast.error(err.message);

  const createOrder = async (data, actions) => {
    const usdAmount = (order.totalPrice * 0.054).toFixed(2); // Example conversion
    return actions.order.create({ purchase_units: [{ amount: { value: usdAmount, currency_code: "USD" } }] });
  };

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success("Order delivered");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p><strong>Name: </strong>{order.user.name}</p>
              <p><strong>Email: </strong><a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
              <p><strong>Phone: </strong>{order.shippingAddress.phone}</p>
              <p><strong>Address: </strong>{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
              {order.isDelivered ? <Message variant="success">Delivered on {order.deliveredAt}</Message> : <Message variant="danger">Not Delivered</Message>}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p><strong>Method: </strong>{order.paymentMethod}</p>
              {order.isPaid ? <Message variant="success">Paid on {order.paidAt}</Message> : <Message variant="danger">Not Paid</Message>}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? <Message>Order is empty</Message> : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}><Image src={item.image} alt={item.name} fluid rounded /></Col>
                        <Col><Link to={`/product/${item.product}`}>{item.name}</Link></Col>
                        <Col md={4}>{item.qty} x R{item.price} = R{item.qty * item.price}</Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item><h2>Order Summary</h2></ListGroup.Item>
              <ListGroup.Item><Row><Col>Items</Col><Col>R{order.itemsPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Shipping</Col><Col>R{order.shippingPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Vat</Col><Col>R{order.vatPrice}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Total</Col><Col>R{order.totalPrice}</Col></Row></ListGroup.Item>

              {!order.isPaid && (
                <>
                  <ListGroup.Item>
                    {loadingPay && <Loader />}
                    {isPending ? <Loader /> : (
                      <div>
                        <p><strong>Pay with PayPal</strong></p>
                        <p className="text-muted small">Note: You will be charged in USD</p>
                        <PayPalButtons fundingSource={FUNDING.CARD} createOrder={createOrder} onApprove={onApprove} onError={onError} />
                      </div>
                    )}
                  </ListGroup.Item>

                  <ListGroup.Item>
                    {loadingPayFast ? <Loader /> : payfastData ? (
                      <div>
                        <p><strong>Pay with PayFast</strong></p>
                        <p className="text-muted small">Note: You will be charged in ZAR</p>
                        <form action="https://sandbox.payfast.co.za/eng/process" method="POST">
                          {payfastFieldOrder.map((key) => <input key={key} type="hidden" name={key} value={payfastData[key] || ""} />)}
                          <Button type="submit" variant="primary" className="w-100" style={{ backgroundColor: "#00a95c", borderColor: "#00a95c" }}>Pay Now with PayFast</Button>
                        </form>
                      </div>
                    ) : <Message variant="warning">PayFast payment option unavailable</Message>}
                  </ListGroup.Item>
                </>
              )}

              {loadingDeliver && <Loader />}
              {userInfo?.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button type="button" className="btn btn-block" onClick={deliverOrderHandler}>Mark As Delivered</Button>
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
