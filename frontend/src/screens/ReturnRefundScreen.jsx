import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const ReturnRefundScreen = () => {
  return (
    <div className="return-refund-page">
      <Container>
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Returns & Refunds Policy</h1>
          </Col>
        </Row>

        <Row>
          <Col md={8} className="mx-auto">
            <section className="mb-5">
              <h2>Return Policy</h2>
              <p>
                At MEKA.WC, customer satisfaction is our priority. If you are not
                completely satisfied with your purchase, you may exchange the
                item(s) under the following conditions:
              </p>
              <ul>
                <li>The item must be exchanged within 30 days of delivery.</li>
                <li>The item must not show signs of wear and must be returned in it's original packaging.</li>
                <li>A receipt or proof of purchase must be provided.</li>
              </ul>
            </section>

            {/* <section className="mb-5">
              <h2>Refund Policy</h2>
              <p>
                Once we receive and inspect your returned item, we will notify
                you of the status of your refund. If approved, your refund will
                be processed, and the amount will be automatically applied to
                your original method of payment within 5-7 business days.
              </p>
              <ul>
                <li>Shipping costs are non-refundable.</li>
                <li>
                  If you receive a refund, the cost of return shipping (if
                  applicable) will be deducted from your refund.
                </li>
              </ul>
            </section> */}

            <section className="mb-5">
              <h2>How to Initiate a Return or an Exchange</h2>
              <ol>
                <li>
                  Contact our customer support team at
                  <a href="mailto:meka4lwd@gmail.com"> meka4lwd@gmail.com</a>
                  or call us at +27 (21) 442-8446 to request a return.
                </li>
                <li>
                  Provide your order number and details about the item(s) you
                  wish to return.
                </li>
                <li>
                  Our team will provide you with further instructions and a
                  return shipping address.
                </li>
              </ol>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about our Returns & Refunds Policy,
                please don’t hesitate to contact us:
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

export default ReturnRefundScreen;
