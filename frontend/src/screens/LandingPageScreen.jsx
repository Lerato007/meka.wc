import { useSelector } from "react-redux";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useGetTopProductsQuery } from "../slices/productsApiSlice"; // Replace with useGetFeaturedProductQuery if using the new query
import Loader from "../components/Loader";
import Message from "../components/Message";
import { Carousel } from "react-bootstrap";
import "../assets/styles/LandingPage.css";

const LandingPageScreen = () => {
  const navigate = useNavigate();

  // Access user authentication state
  const { userInfo } = useSelector((state) => state.auth);

  const { data: products, isLoading, error } = useGetTopProductsQuery();

  const product = products && products.length > 0 ? products[0] : null;

  const handleShopNowClick = () => {
    navigate(`/home`);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <Carousel controls={false} indicators={false} interval={3000} pause={false}>
          <Carousel.Item>
            <div className="hero-image" style={{ backgroundImage: "url('/images/img1.jpg')" }}>
              <Container fluid className="p-0">
                <h1 className="hero-title">4FOUR LETTER WORD</h1>
                <div className="hero-buttons">
                  {/* If user is NOT logged in → Show Sign Up & Login */}
                  {!userInfo ? (
                    <>
                      <Button
                        variant="light"
                        className="hero-btn explore-btn"
                        onClick={() => navigate("/register")}
                      >
                        Sign Up
                      </Button>
                      <Button
                        variant="outline-light"
                        className="hero-btn shop-btn"
                        onClick={() => navigate("/login")}
                      >
                        Login
                      </Button>
                    </>
                  ) : (
                    // If user IS logged in → Show Shop Now
                    <Button
                      variant="dark"
                      className="hero-btn shop-btn"
                      onClick={handleShopNowClick}
                    >
                      Shop Now
                    </Button>
                  )}
                </div>
              </Container>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <div className="hero-image" style={{ backgroundImage: "url('/images/img2.jpg')" }}>
              <Container fluid className="p-0">
                <h1 className="hero-title">Unleash Your Style</h1>
                <div className="hero-buttons">
                  {!userInfo ? (
                    <>
                      <Button
                        variant="light"
                        className="hero-btn explore-btn"
                        onClick={() => navigate("/register")}
                      >
                        Sign Up
                      </Button>
                      <Button
                        variant="outline-light"
                        className="hero-btn shop-btn"
                        onClick={() => navigate("/login")}
                      >
                        Login
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="dark"
                      className="hero-btn shop-btn"
                      onClick={handleShopNowClick}
                    >
                      Shop Now
                    </Button>
                  )}
                </div>
              </Container>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <div className="hero-image" style={{ backgroundImage: "url('/images/img3.jpg')" }}>
              <Container fluid className="p-0">
                <h1 className="hero-title">Streetwear Redefined</h1>
                <div className="hero-buttons">
                  {!userInfo ? (
                    <>
                      <Button
                        variant="light"
                        className="hero-btn explore-btn"
                        onClick={() => navigate("/register")}
                      >
                        Sign Up
                      </Button>
                      <Button
                        variant="outline-light"
                        className="hero-btn shop-btn"
                        onClick={() => navigate("/login")}
                      >
                        Login
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="dark"
                      className="hero-btn shop-btn"
                      onClick={handleShopNowClick}
                    >
                      Shop Now
                    </Button>
                  )}
                </div>
              </Container>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Featured Product Section */}
      <div className="product-section py-5">
        <Container>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error?.data.message || error.error}</Message>
          ) : (
            product && (
              <Row>
                <Col md={6} className="text-center">
                  <img
                    src={product.image}
                    loading="lazy"
                    alt={product.name}
                    className="product-image"
                  />
                </Col>
                <Col md={6} className="product-details">
                  <h2 className="product-title">{product.name}</h2>
                  {/* Price and Static 5-Star Rating */}
                  <div className="star-rating">
                     <i className="fas fa-star"></i>
                     <i className="fas fa-star"></i>
                     <i className="fas fa-star"></i>
                     <i className="fas fa-star"></i>
                     <i className="fas fa-star"></i>
                 </div>
                  <p className="product-price">R{product.price}</p>
                  <p className="product-description">{product.description}</p>
                  <Button
                    variant="dark"
                    className="shop-now-btn"
                    onClick={handleShopNowClick}
                  >
                    Shop Now
                  </Button>
                </Col>
              </Row>
            )
          )}
        </Container>
      </div>
     {/* Features Section */}
     <div className="features-section py-5">
        <Container>
          <Row>
            <Col md={4} className="text-center">
            <source srcSet="/images/img5.webp" type="image/webp" />
               <img src="/images/img5.JPG"
                 loading="lazy"
                 alt="Quality Materials"
                 className="feature-image"
                />
              <h3 className="feature-title mt-3">Quality Materials</h3>
              <p className="feature-text">
                Premium fabrics that offer comfort and durability.
              </p>
            </Col>
            <Col md={4} className="text-center">
            <source srcSet="/images/img2.webp" type="image/webp" />
                <img
                  src="/images/img2.jpg"
                  loading="lazy"
                  alt="Unique Designs"
                  className="feature-image"
                />
              <h3 className="feature-title mt-3">Unique Designs</h3>
              <p className="feature-text">
                Stand out with bold patterns and minimalistic streetwear.
              </p>
            </Col>
            <Col md={4} className="text-center">
            <source srcSet="/images/img4.webp" type="image/webp" />
                <img
                  src="/images/img4.jpg"
                  loading="lazy"
                  alt="Sustainable Fashion"
                  className="feature-image"
                />
              <h3 className="feature-title mt-3">Sustainable Fashion</h3>
              <p className="feature-text">
                Designed with eco-friendly practices for a better future.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Overview Section */}
      <div className="features-overview py-5">
        <Container>
          <Row className="text-center">
            <Col md={3}>
              <div className="feature-item">
                <i className="fas fa-truck feature-icon"></i>
                <h4 className="feature-title mt-3">Speedy Shipping</h4>
                <p className="feature-text">
                  Nationwide: 5-10 business days.
                </p>
              </div>
            </Col>
            <Col md={3}>
              <div className="feature-item">
                <i className="fas fa-undo feature-icon"></i>
                <h4 className="feature-title mt-3">Returns</h4>
                <p className="feature-text">
                  Return online orders by contacting us.
                </p>
              </div>
            </Col>
            <Col md={3}>
              <div className="feature-item">
                <i className="fas fa-lock feature-icon"></i>
                <h4 className="feature-title mt-3">Secure Payments</h4>
                <p className="feature-text">
                  Encryption technology ensures safe checkout. <br />
                  <strong>Credit Cards</strong>
                </p>
              </div>
            </Col>
            <Col md={3}>
              <div className="feature-item">
                <i className="fas fa-headset feature-icon"></i>
                <h4 className="feature-title mt-3">Helpful Support</h4>
                <p className="feature-text">
                  Our support team is dedicated to helping you, pre- and
                  post-purchase.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call-to-Action Section */}
      <div className="video-banner">
        <video
          className="video-banner-content"
          src="/images/final_product.mp4"
          loading="lazy"
          autoPlay
          loop
          muted
        />
        <div className="video-banner-overlay">
          <Container></Container>
        </div>
      </div>
    </div>
  );
};

export default LandingPageScreen;
