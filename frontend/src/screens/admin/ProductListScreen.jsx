import { Link, useParams } from "react-router-dom";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import Paginate from "../../components/Paginate";
import { useGetProductsQuery, useCreateProductMutation, useDeleteProductMutation } from "../../slices/productsApiSlice";
import { toast } from "react-toastify";

const ProductListScreen = () => {
  const { pageNumber } = useParams();

  const { data, isLoading, error, refetch } = useGetProductsQuery({ pageNumber });
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation();
  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Delete this product? This cannot be undone.")) {
      try {
        await deleteProduct(id);
        refetch();
        toast.success("Product deleted");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = async () => {
    if (window.confirm("Create a new product draft?")) {
      try {
        await createProduct();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Products</h1>
          <div className="admin-page__accent" />
        </div>
        <button className="admin-create-btn" onClick={createProductHandler}>
          <FaPlus size={12} /> Create Product
        </button>
      </div>

      {(loadingCreate || loadingDelete) && <Loader />}

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.data?.message || error.message}</Message>
      ) : (
        <>
          <Paginate pages={data.pages} page={data.page} isAdmin={true} />

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Stock</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product) => (
                  <tr key={product._id}>
                    <td><span className="cell-id">{product._id}</span></td>
                    <td className="cell-name">{product.name}</td>
                    <td className="cell-price">R{product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: product.countInStock > 0 ? "var(--meka-green)" : "var(--bs-danger)",
                      }}>
                        {product.countInStock > 0 ? product.countInStock : "Out"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <Link
                        to={`/admin/product/${product._id}/edit`}
                        className="admin-action-btn"
                        title="Edit product"
                      >
                        <FaEdit size={13} />
                      </Link>
                      <button
                        className="admin-action-btn danger"
                        onClick={() => deleteHandler(product._id)}
                        title="Delete product"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paginate pages={data.pages} page={data.page} isAdmin={true} />
        </>
      )}
    </>
  );
};

export default ProductListScreen;