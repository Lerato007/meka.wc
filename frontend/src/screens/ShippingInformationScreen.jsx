import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const ShippingInformationScreen = () => {
  return (
    <div className="shipping-information-page">
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Shipping Information</h1>
            <p className="text-muted text-center">
              Find out everything you need to know about our shipping process.
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={8} className="mx-auto">
            <section className="mb-5">
              <h2>Shipping Rates</h2>
              <p>
                At MEKA.WC, we offer transparent and straightforward shipping
                rates to ensure you have a great shopping experience:
              </p>
              <ul>
                <li>
                  <strong>Paarl & Wellington:</strong> Free shipping on all orders.
                </li>
                <li>
                  <strong>Outside Areas:</strong> R100 shipping fee for orders
                  below R500. Free shipping for orders over R500.
                </li>
              </ul>
            </section>

            <section className="mb-5">
              <h2>Delivery Times</h2>
              <p>
                We strive to deliver your orders as quickly as possible. Please
                find our estimated delivery times below:
              </p>
              <ul>
                <li>
                  <strong>Delivery Estimation:</strong> 5-8 business days.
                </li>
              </ul>
              <p>
                Note: Delivery times may vary during peak seasons or due to
                unforeseen circumstances.
              </p>
            </section>

            <section className="mb-5">
              <h2>Shipping Restrictions</h2>
              <p>
                Please note that we currently only ship within South Africa.
                For special shipping requests or bulk orders, contact our
                support team.
              </p>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about shipping or need assistance
                with your order, feel free to contact us:
              </p>
              <p>
                Email: <a href="mailto:meka4lwd@gmail.com">meka4lwd@gmail.com</a>
              </p>
              <p>Phone: +27 (21) 442-8446</p>
              <p>Address: 22 Mrabaraba St, Paarl, S.A</p>
            </section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ShippingInformationScreen;
