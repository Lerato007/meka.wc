import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Star = ({ value, threshold }) => {
  if (value >= threshold) return <FaStar className="rating__star" />;
  if (value >= threshold - 0.5) return <FaStarHalfAlt className="rating__star" />;
  return <FaRegStar className="rating__star rating__star--empty" />;
};

const Rating = ({ value = 0, text }) => (
  <div className="rating">
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} className="rating__star">
        <Star value={value} threshold={n} />
      </span>
    ))}
    {text && <span className="rating-text">{text}</span>}
  </div>
);

export default Rating;