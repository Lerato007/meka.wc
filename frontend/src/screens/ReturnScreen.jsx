import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import Message from "../components/Message";

const ReturnScreen = () => {
  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={8}>
        <Card className="p-4">
          <Message variant="success">Payment Successful!</Message>
          <h2>Your payment has been processed successfully.</h2>
          <p>You can view your order details in your order history.</p>
          <Link to="/orderhistory">
            <Button variant="primary">Go to Orders</Button>
          </Link>
        </Card>
      </Col>
    </Row>
  );
};

export default ReturnScreen;
