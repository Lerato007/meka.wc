import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import Message from "../components/Message";

const CancelScreen = () => {
  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={8}>
        <Card className="p-4">
          <Message variant="danger">Payment Canceled!</Message>
          <h2>It seems you canceled the payment process.</h2>
          <p>No worries, you can retry the payment or return to the store.</p>
          <Link to="/cart">
            <Button variant="primary" className="m-2">
              Retry Payment
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="secondary" className="m-2">
              Return to Store
            </Button>
          </Link>
        </Card>
      </Col>
    </Row>
  );
};

export default CancelScreen;
