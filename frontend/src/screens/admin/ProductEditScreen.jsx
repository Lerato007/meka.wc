import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from "../../slices/productsApiSlice";

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [name,         setName]         = useState("");
  const [price,        setPrice]        = useState(0);
  const [image,        setImage]        = useState("");
  const [brand,        setBrand]        = useState("");
  const [category,     setCategory]     = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description,  setDescription]  = useState("");

  const { data: product, isLoading, error } = useGetProductDetailsQuery(productId);
  const [updateProduct,      { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({ productId, name, price, image, brand, category, description, countInStock });
      toast.success("Product updated");
      navigate("/admin/productlist");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/admin/productlist" className="admin-back-link">
        <FaArrowLeft size={11} /> Back to Products
      </Link>

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message}</Message>
      ) : (
        <div className="admin-edit-card">
          <h1 className="admin-edit-card__title">Edit Product</h1>
          <div className="admin-edit-card__accent" />

          {loadingUpdate && <Loader />}

          <Form onSubmit={submitHandler}>

            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="price" className="mb-3">
              <Form.Label>Price (R)</Form.Label>
              <Form.Control
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </Form.Group>

            <Form.Group controlId="image" className="mb-3">
              <Form.Label>Product Image</Form.Label>
              {image && (
                <img src={image} alt="Product preview" className="product-image-preview" />
              )}
              <Form.Control
                type="text"
                placeholder="Image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="mb-2"
              />
              <Form.Control
                type="file"
                onChange={uploadFileHandler}
                accept="image/*"
              />
              {loadingUpload && <Loader />}
            </Form.Group>

            <Form.Group controlId="brand" className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="category" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Hoodies, Tees"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="countInStock" className="mb-3">
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                min="0"
              />
            </Form.Group>

            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Product description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <button
              type="submit"
              className="admin-save-btn"
              disabled={loadingUpdate}
            >
              {loadingUpdate ? "Saving..." : "Save Changes"}
            </button>
          </Form>
        </div>
      )}
    </>
  );
};

export default ProductEditScreen;