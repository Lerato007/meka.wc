import { LinkContainer } from "react-router-bootstrap";

const Paginate = ({ pages, page, isAdmin = false, keyword = "" }) => {
  if (pages <= 1) return null;

  const getTo = (pageNum) => {
    if (isAdmin) return `/admin/productlist/${pageNum}`;
    if (keyword) return `/search/${keyword}/page/${pageNum}`;
    return `/page/${pageNum}`;
  };

  return (
    <div className="paginate-wrap">
      {[...Array(pages).keys()].map((x) => {
        const pageNum = x + 1;
        const isActive = pageNum === page;
        return (
          <LinkContainer key={pageNum} to={getTo(pageNum)}>
            <button className={`page-btn${isActive ? " active" : ""}`}>
              {pageNum}
            </button>
          </LinkContainer>
        );
      })}
    </div>
  );
};

export default Paginate;