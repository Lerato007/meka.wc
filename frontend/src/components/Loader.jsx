import React from "react";

const Loader = ({ size = "md" }) => (
  <div className={`meka-loader${size === "sm" ? " meka-loader--sm" : ""}`}>
    <div className="meka-loader__ring" role="status" aria-label="Loading" />
  </div>
);

export default Loader;