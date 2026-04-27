import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge, Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaShoppingCart, FaUser, FaChevronDown } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import SearchBox from "./SearchBox";
import { resetCart } from "../slices/cartSlice";

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === "/";

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const cartCount = cartItems.reduce((a, c) => a + c.qty, 0);

  return (
    <header style={{
      position: isLanding ? "absolute" : "relative",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>
      <Navbar
        variant="dark"
        expand="md"
        collapseOnSelect
        style={{
          backgroundColor: isLanding
            ? scrolled
              ? "rgba(26, 26, 24, 0.97)"
              : "rgba(26, 26, 24, 0.55)"
            : "var(--bg-dark)",
          backdropFilter: isLanding ? "blur(12px)" : "none",
          WebkitBackdropFilter: isLanding ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid transparent",
          transition: "all 0.3s ease",
          padding: "0.6rem 0",
        }}
      >
        <Container>
          {/* Brand / Logo */}
          <LinkContainer to="/">
            <Navbar.Brand style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.4rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: 0,
            }}>
              <span style={{
                color: "var(--meka-green)",
                fontSize: "1.5rem",
                lineHeight: 1,
              }}>▸</span>
              MEKA.WC
            </Navbar.Brand>
          </LinkContainer>

          {/* Search */}
          <SearchBox />

          {/* Mobile toggle */}
          <Navbar.Toggle
            aria-controls="main-navbar"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              padding: "0.3rem 0.6rem",
            }}
          />

          <Navbar.Collapse id="main-navbar">
            <Nav className="ms-auto align-items-center" style={{ gap: "0.1rem" }}>

              {/* Cart */}
              <LinkContainer to="/cart">
                <Nav.Link style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.82)",
                  padding: "0.5rem 0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  position: "relative",
                  transition: "color 0.15s ease",
                }}>
                  <FaShoppingCart size={13} />
                  Cart
                  {cartCount > 0 && (
                    <Badge
                      pill
                      style={{
                        backgroundColor: "var(--meka-green)",
                        fontSize: "0.62rem",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        padding: "2px 6px",
                        marginLeft: "2px",
                        lineHeight: 1.4,
                      }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {/* User menu */}
              {userInfo ? (
                <NavDropdown
                  title={
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.82)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}>
                      <FaUser size={12} />
                      {userInfo.name.split(" ")[0]}
                    </span>
                  }
                  id="username"
                  align="end"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                    }}>
                      Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={logoutHandler}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "var(--bs-danger)",
                    }}
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: "#fff",
                    backgroundColor: "var(--meka-green)",
                    border: "2px solid var(--meka-green)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.42rem 1.1rem",
                    marginLeft: "0.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "all 0.2s ease",
                  }}>
                    <FaUser size={11} />
                    Sign In
                  </Nav.Link>
                </LinkContainer>
              )}

              {/* Admin menu */}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown
                  title={
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.65)",
                    }}>
                      Admin
                    </span>
                  }
                  id="adminmenu"
                  align="end"
                >
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
                      Products
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
                      Users
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
                      Orders
                    </NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;