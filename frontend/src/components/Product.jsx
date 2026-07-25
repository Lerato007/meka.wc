import React from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating";

const Product = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card__image-wrap">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <Rating
          value={product.rating}
          text={`${product.numReviews} reviews`}
        />
        <p className="product-card__price">R{product.price}</p>
      </div>
    </Link>
  );
};

export default Product;