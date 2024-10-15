import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, ListGroup, Image, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axios from "axios";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
} from "../slices/ordersApiSlice";

/* Code starts here*/
const OrderScreen = () => {
  const { id: orderId } = useParams();
  const [signature, setSignature] = useState("");
  const [loadingSignature, setLoadingSignature] = useState(false);
  const [payfastData, setPayfastData] = useState(null);
  const formRef = useRef(null); // Form reference for submitting

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success("Order delivered");
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  // Fetch the PayFast signature and generate the payment form when the component mounts
  useEffect(() => {
    const fetchSignature = async () => {
      setLoadingSignature(true);

      const merchantId = "25297857"; // Your merchant ID
      const merchantKey = "1yttopb7zgk7y"; // Your merchant key
      const returnUrl = "https://meka-wc.onrender.com/success";
    const cancelUrl = "https://meka-wc.onrender.com/cancel";
    const notifyUrl = "https://meka-wc.onrender.com/";
      const myPassphrase = "Graphics_7598"; // Your passphrase

      const data = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        name_first: order?.user?.name,
        email_address: order?.user?.email,
        m_payment_id: order?._id,
        amount: order?.totalPrice.toFixed(2),
        item_name: `Order ${order?._id}`,
        currency: "ZAR",
      };

      // Log the parameter string
    const paramString = `merchant_id=${merchantId}&merchant_key=${merchantKey}&return_url=${encodeURIComponent(returnUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&notify_url=${encodeURIComponent(notifyUrl)}&name_first=${encodeURIComponent(data.name_first)}&email_address=${encodeURIComponent(data.email_address)}&m_payment_id=${encodeURIComponent(data.m_payment_id)}&amount=${encodeURIComponent(data.amount)}&item_name=${encodeURIComponent(data.item_name)}&currency=${data.currency}`;
    
    console.log("Generated Parameter String:", paramString);

      try {
        // Make an API call to generate the signature
        const { data: response } = await axios.post(
          "/api/payfast/generate-signature",
          { data, passphrase: myPassphrase }
        );
        setSignature(response.signature);

        // Log the generated signature
      console.log("Generated PayFast Signature:", response.signature);

        // Save the PayFast data for rendering
        setPayfastData({
          ...data,
          signature: response.signature,
        });
      } catch (error) {
        console.error("Error generating signature", error);
      } finally {
        setLoadingSignature(false);
      }
    };

    if (order) {
      fetchSignature();
    }
  }, [order]);

  const handlePayNow = () => {
    if (formRef.current) {
      formRef.current.submit();
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
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{" "}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">Paid on {order.paidAt}</Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>

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
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x R{item.price} = R{item.qty * item.price}
                        </Col>
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
                  <Col>R{order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Vat</Col>
                  <Col>R{order.vatPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>R{order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {!order.isPaid && (
                <ListGroup.Item>
                  {/* Render PayFast Form */}
                  {payfastData && (
                    <form
                      action="https://www.payfast.co.za/eng/process"
                      method="post"
                      ref={formRef}
                      id="payfast-payment-form"
                    >
                      {Object.entries(payfastData).map(([key, value]) => (
                        <input
                          key={key}
                          name={key}
                          type="hidden"
                          value={value}
                        />
                      ))}
                      <Button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={handlePayNow}
                        disabled={loadingSignature}
                      >
                        {loadingSignature ? <Loader /> : "Pay Now with PayFast"}
                      </Button>
                    </form>
                  )}
                </ListGroup.Item>
              )}

              {loadingDeliver && <Loader />}

              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type="button"
                      className="btn btn-block"
                      onClick={deliverOrderHandler}
                    >
                      Mark As Delivered
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
