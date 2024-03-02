import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaInfoCircle,
  FaShoppingCart,
  FaEnvelope,
  FaFileAlt,
  FaLock,
} from "react-icons/fa";
import {
  AiFillFacebook,
  AiOutlineTwitter,
  AiFillInstagram,
} from "react-icons/ai";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Contact Us</h5>
            <p>Email: info@example.com</p>
            <p>Phone: 123-456-7890</p>
            <p>Address: 1234 Main St, City, Country</p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/about">
                  <FaInfoCircle /> About Us
                </a>
              </li>
              <li>
                <a href="/products">
                  <FaShoppingCart /> Products
                </a>
              </li>
              <li>
                <a href="/contact">
                  <FaEnvelope /> Contact Us
                </a>
              </li>
              <li>
                <a href="/terms">
                  <FaFileAlt /> Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy">
                  <FaLock /> Privacy Policy
                </a>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Follow Us</h5>
            <ul className="list-unstyled">
              <li>
                <a
                  href="https://www.facebook.com/example"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiFillFacebook /> Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/example"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiOutlineTwitter /> Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/example"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiFillInstagram /> Instagram
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col className="text-center py-3">
            <p>StudentMarket© {currentYear}</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
