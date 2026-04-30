import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const SearchBox = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();
  const [keyword, setKeyword] = useState(urlKeyword || "");

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
      setKeyword("");
    } else {
      navigate("/home");
    }
  };

  return (
    <form onSubmit={submitHandler} className="search-form">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search products..."
        className="search-form__input"
        aria-label="Search products"
      />
      <button type="submit" className="search-form__btn" aria-label="Search">
        <FaSearch size={12} />
      </button>
    </form>
  );
};

export default SearchBox;