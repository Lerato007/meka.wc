import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.62)",
    textDecoration: "none",
    transition: "color 0.15s ease",
    display: "inline-block",
    lineHeight: 1.7,
  };

  const headingStyle = {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "0.72rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    marginBottom: "1.1rem",
  };

  const contactStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "0.88rem",
    color: "rgba(255,255,255,0.62)",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    marginBottom: "0.65rem",
    lineHeight: 1.5,
  };

  const iconStyle = {
    color: "var(--meka-green)",
    marginTop: "3px",
    flexShrink: 0,
    fontSize: "0.82rem",
  };

  return (
    <footer style={{
      backgroundColor: "var(--bg-dark)",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      paddingTop: "3.5rem",
      paddingBottom: "0",
    }}>
      <Container>
        {/* Top row */}
        <Row className="mb-4">

          {/* Brand column */}
          <Col lg={3} md={6} className="mb-4">
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.5rem",
              letterSpacing: "0.1em",
              color: "#fff",
              marginBottom: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}>
              <span style={{ color: "var(--meka-green)", fontSize: "1.6rem" }}>▸</span>
              MEKA.WC
            </div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.88rem",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              maxWidth: "220px",
              margin: 0,
            }}>
              Premium South African streetwear from Paarl, Western Cape.
              Wear your culture.
            </p>
          </Col>

          {/* Customer Service */}
          <Col lg={2} md={6} className="mb-4">
            <h5 style={headingStyle}>Customer Service</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li>
                <Link to="/returns" style={linkStyle}>Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/shippingInfo" style={linkStyle}>Shipping Information</Link>
              </li>
            </ul>
          </Col>

          {/* About */}
          <Col lg={2} md={6} className="mb-4">
            <h5 style={headingStyle}>About</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li>
                <Link to="/about-us" style={linkStyle}>Our Story</Link>
              </li>
            </ul>
          </Col>

          {/* Contact */}
          <Col lg={3} md={6} className="mb-4">
            <h5 style={headingStyle}>Contact</h5>
            <div style={contactStyle}>
              <FaPhoneAlt style={iconStyle} />
              <span>+27 (21) 442-8446</span>
            </div>
            <div style={contactStyle}>
              <FaEnvelope style={iconStyle} />
              <span>meka4lwd@gmail.com</span>
            </div>
            <div style={contactStyle}>
              <FaMapMarkerAlt style={iconStyle} />
              <span>22 Mrabaraba St, Paarl, S.A</span>
            </div>
          </Col>

          {/* Social */}
          <Col lg={2} md={6} className="mb-4">
            <h5 style={headingStyle}>Follow Us</h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <a
                href="https://facebook.com/profile.php?id=61558156191066&mibextid=Zb-WKwL"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...linkStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                }}
              >
                <span style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "0.75rem",
                }}>
                  <FaFacebookF />
                </span>
                Facebook
              </a>
              <a
                href="https://www.instagram.com/meka.wc/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...linkStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                }}
              >
                <span style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "0.75rem",
                }}>
                  <FaInstagram />
                </span>
                Instagram
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...linkStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                }}
              >
                <span style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "0.75rem",
                }}>
                  <FaTwitter />
                </span>
                Twitter
              </a>
            </div>
          </Col>
        </Row>

        {/* Divider */}
        <hr style={{
          borderColor: "rgba(255,255,255,0.06)",
          margin: "0 0 1.25rem",
        }} />

        {/* Bottom bar */}
        <Row>
          <Col className="text-center" style={{ paddingBottom: "1.5rem" }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.04em",
              margin: 0,
            }}>
              &copy; {currentYear} MEKA.WC. All rights reserved.
              {" · "}
              <a href="/#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                Terms of Service
              </a>
              {" · "}
              <a href="/#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
                Privacy Policy
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;