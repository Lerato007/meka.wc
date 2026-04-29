import React from "react";
import { Row, Col } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../slices/productsApiSlice";
import Product from "../components/Product";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Paginate from "../components/Paginate";
import Meta from "../components/Meta";

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
  });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta />

          {/* Page header */}
          <div style={{ marginBottom: "2rem", marginTop: "0.5rem" }}>
            {keyword ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}>
                <div>
                  <p style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--meka-green)",
                    margin: "0 0 0.25rem",
                  }}>
                    Search results
                  </p>
                  <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--text-primary)",
                    margin: 0,
                  }}>
                    "{keyword}"
                  </h1>
                </div>
                <Link
                  to="/home"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    border: "1.5px solid var(--border-default)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.45rem 1.1rem",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    display: "inline-block",
                  }}
                >
                  ← All Products
                </Link>
              </div>
            ) : (
              <div>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--meka-green)",
                  margin: "0 0 0.25rem",
                }}>
                  4 Four Letter Word
                </p>
                <h1 style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                  margin: "0 0 0.2rem",
                }}>
                  Featured Products
                </h1>
                {/* Green accent bar */}
                <div style={{
                  width: "40px",
                  height: "3px",
                  backgroundColor: "var(--meka-green)",
                  borderRadius: "999px",
                  marginTop: "0.5rem",
                }} />
              </div>
            )}
          </div>

          {/* Top pagination */}
          <Paginate
            pages={data.pages}
            page={data.page}
            keyword={keyword || ""}
          />

          {/* Product grid */}
          <Row>
            {data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>

          {/* Bottom pagination */}
          <Paginate
            pages={data.pages}
            page={data.page}
            keyword={keyword || ""}
          />
        </>
      )}
    </>
  );
};

export default HomeScreen;