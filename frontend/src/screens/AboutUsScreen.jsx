import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../assets/styles/AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us">
      <Container>
        <h1 className="text-center my-5">About Us</h1>

        {/* Section 1 */}
        <Row className="align-items-center mb-5">
          <Col md={6}>
            <img
              src="/images/IMG_1303.jpg"
              alt="Our Journey"
              className="img-fluid rounded shadow"
            />
          </Col>
          <Col md={6}>
            <h2>Our Journey</h2>
            <p>
              MEKA.WC was born out of a passion for streetwear and a desire to
              provide bold, fashion-forward clothing at an affordable price.
              What started as a dream has grown into a thriving brand that
              empowers individuals to express their unique styles.
            </p>
            <p>
              We’re driven by creativity, authenticity, and the belief that
              fashion should be accessible to everyone. Join us on our journey
              as we continue to redefine the meaning of unisex streetwear.
            </p>
          </Col>
        </Row>

        {/* Section 2 */}
        <Row className="align-items-center mb-5 flex-md-row-reverse">
          <Col md={6}>
            <img
              src="/images/IMG_1601.jpg"
              alt="Our Vision"
              className="img-fluid rounded shadow"
            />
          </Col>
          <Col md={6}>
            <h2>Our Vision</h2>
            <p>
              At MEKA.WC, we envision a world where self-expression is
              celebrated, and fashion is a tool for empowerment. Our designs are
              inspired by the vibrant cultures of the streets, blending bold
              patterns with minimalistic elegance to create standout pieces.
            </p>
            <p>
              Sustainability and community are at the heart of everything we do.
              We strive to make a positive impact by embracing eco-friendly
              practices and supporting local artisans.
            </p>
          </Col>
        </Row>

        {/* Section 3 */}
        <Row className="align-items-center mb-5">
          <Col md={6}>
            <img
              src="/images/IMG_1369.jpg"
              alt="Our Values"
              className="img-fluid rounded shadow"
            />
          </Col>
          <Col md={6}>
            <h2>Our Values</h2>
            <p>
              Integrity, inclusivity, and innovation are the core values that
              shape MEKA.WC. We believe in creating clothing that not only looks
              good but also feels good – inside and out. Our commitment to
              quality ensures that every piece is crafted with care and
              attention to detail.
            </p>
            <p>
              Thank you for being part of our story. Together, let’s make the
              world a little more stylish and a lot more authentic.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUs;
