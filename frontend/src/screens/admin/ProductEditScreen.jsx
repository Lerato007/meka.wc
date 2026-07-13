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
  const [sizeStock,    setSizeStock]    = useState({ S: 0, M: 0, L: 0, XL: 0 });
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
      setSizeStock({
        S:  product.sizeStock?.S  || 0,
        M:  product.sizeStock?.M  || 0,
        L:  product.sizeStock?.L  || 0,
        XL: product.sizeStock?.XL || 0,
      });
      setDescription(product.description);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProduct({ productId, name, price, image, brand, category, description, sizeStock });
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

            <Form.Group controlId="sizeStock" className="mb-3">
              <Form.Label>Stock by Size</Form.Label>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {["S", "M", "L", "XL"].map((sz) => (
                  <div key={sz} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>{sz}</span>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={sizeStock[sz]}
                      onChange={(e) =>
                        setSizeStock((prev) => ({ ...prev, [sz]: Number(e.target.value) }))
                      }
                      min="0"
                      style={{ width: "80px", textAlign: "center" }}
                    />
                  </div>
                ))}
              </div>
              <Form.Text muted>
                Total stock: {Object.values(sizeStock).reduce((a, b) => a + Number(b || 0), 0)}
              </Form.Text>
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