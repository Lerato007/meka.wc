import { useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";

const NotifyScreen = () => {
  useEffect(() => {
    // Simulating handling IPN data in the backend
    const handleIPN = async () => {
      // You would replace this with your backend IPN handling logic
      console.log("Processing PayFast IPN...");
      // Fetch or post to your backend for IPN validation
    };

    handleIPN();
  }, []);

  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={8}>
        <Card className="p-4">
          <h2>Payment Notification Received</h2>
          <p>
            The payment notification has been received and is being processed.
          </p>
        </Card>
      </Col>
    </Row>
  );
};

export default NotifyScreen;
