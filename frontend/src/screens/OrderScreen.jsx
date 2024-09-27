import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, ListGroup, Image, Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
} from "../slices/ordersApiSlice";

const OrderScreen = () => {
  console.log('Merchant ID:', process.env.REACT_APP_PAYFAST_MERCHANT_ID);
  console.log('Merchant Key:', process.env.REACT_APP_PAYFAST_MERCHANT_KEY);
  const { id: orderId } = useParams();

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

  // Generate the payment form fields
  const generatePayFastForm = () => {
    const merchantId = "10000100";
    const merchantKey = "46f0cd694581a";
    const returnUrl = "https://meka-wc.onrender.com/";
    const cancelUrl = "https://meka-wc.onrender.com/";
    const notifyUrl = "https://meka-wc.onrender.com/";

    return (
      <form
        action="https://sandbox.payfast.co.za/eng/process"
        method="POST"
        id="payfast-payment-form"
      >
        <input type="hidden" name="merchant_id" value={merchantId} />
        <input type="hidden" name="merchant_key" value={merchantKey} />
        <input type="hidden" name="return_url" value={returnUrl} />
        <input type="hidden" name="cancel_url" value={cancelUrl} />
        <input type="hidden" name="notify_url" value={notifyUrl} />
        <input type="hidden" name="name_first" value={order.user.name} />
        <input
          type="hidden"
          name="email_address"
          value={order.user.email}
        />
        <input type="hidden" name="m_payment_id" value={order._id} />
        <input
          type="hidden"
          name="amount"
          value={order.totalPrice.toFixed(2)}
        />
        <input
          type="hidden"
          name="item_name"
          value={`Order ${order._id}`}
        />
        <input type="hidden" name="currency" value="ZAR" />
        <Button type="submit" className="btn btn-primary btn-block">
          Pay Now with PayFast
        </Button>
      </form>
    );
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
                  {/* Render the PayFast form */}
                  {generatePayFastForm()}
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
