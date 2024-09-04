import { Link } from "react-router-dom";
import { Carousel, Image } from "react-bootstrap";
import Loader from "./Loader";
import Message from "./Message";
import { useGetTopProductsQuery } from "../slices/productsApiSlice";

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  ) : (
    <Carousel pause="hover" style={{ backgroundColor: '#409118', marginBottom: '16px' }}>
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to="#">
            <Image src={"images/newfolder/back_hoodie.jpg"} alt={"product.name"} fluid style={{ maxWidth: "550px", maxHeight: "350px" }}/>
            <Carousel.Caption className="carousel-caption">
              <h1 className="text-white text-right">
                COMING SOON!!!
              </h1>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
