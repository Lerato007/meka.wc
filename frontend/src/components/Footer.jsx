import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import "../assets/styles/index.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <Container>
        <Row className="mb-4 align-items-stretch">
          <Col md={3} className="mb-4">
            <h5>Customer Service</h5>
            <ul className="footer-links">
              {/* <li><a href="/#">Help Center</a></li> */}
              <li><a href="/returns">Returns & Refunds</a></li>
              <li><a href="/shippingInfo">Shipping Information</a></li>
              {/* <li><a href="/#">FAQs</a></li> */}
            </ul>
          </Col>
          <Col md={3} className="mb-4">
            <h5>About Us</h5>
            <p>
              <a href="/about-us">Learn more about our story</a>
            </p>
          </Col>
          <Col md={3} className="mb-4">
            <h5>Contact Us</h5>
            <p><FaPhoneAlt /> +27 (21) 442-8446</p>
            <p><FaEnvelope /> meka4lwd@gmail.com</p>
            <p><FaMapMarkerAlt /> 22 Mrabaraba St, Paarl, S.A</p>
          </Col>
          <Col md={3} className="mb-4">
            <h5>Follow Us</h5>
            <ul className="footer-social">
              <li>
                <a href="https://facebook.com/profile.php?id=61558156191066&mibextid=Zb-WKwL" target="_blank" rel="noopener noreferrer">
                  <FaFacebookF /> Facebook
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FaTwitter /> Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/meka.wc/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram /> Instagram
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col className="text-center">
            <p>
              &copy; {currentYear} MEKA.WC. All rights reserved. |{" "}
              <a href="/#">Terms of Service</a> |{" "}
              <a href="/#">Privacy Policy</a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
