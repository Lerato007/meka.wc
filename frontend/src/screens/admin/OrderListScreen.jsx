import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import { useGetOrdersQuery, useDeleteOrderMutation } from "../../slices/ordersApiSlice";

const AdminPaginate = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="paginate-wrap">
      <button
        className="page-btn"
        onClick={() => onChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        style={{ opacity: page === 1 ? 0.4 : 1 }}
      >
        <FaChevronLeft size={10} />
      </button>
      {[...Array(pages).keys()].map((x) => (
        <button
          key={x + 1}
          className={`page-btn${page === x + 1 ? " active" : ""}`}
          onClick={() => onChange(x + 1)}
        >
          {x + 1}
        </button>
      ))}
      <button
        className="page-btn"
        onClick={() => onChange(Math.min(page + 1, pages))}
        disabled={page === pages}
        style={{ opacity: page === pages ? 0.4 : 1 }}
      >
        <FaChevronRight size={10} />
      </button>
    </div>
  );
};

const OrderListScreen = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error, refetch } = useGetOrdersQuery({ page, pageSize });
  const [deleteOrder, { isLoading: loadingDelete }] = useDeleteOrderMutation();

  const orders = data?.orders || [];
  const pages  = data?.pages  || 1;

  const deleteHandler = async (orderId) => {
    if (window.confirm("Delete this order? This cannot be undone.")) {
      try {
        await deleteOrder(orderId).unwrap();
        toast.success("Order deleted");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete order");
      }
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Orders</h1>
          <div className="admin-page__accent" />
        </div>
        {data && (
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
          }}>
            {orders.length} of {data.total || orders.length} orders
          </span>
        )}
      </div>

      {loadingDelete && <Loader />}

      {isLoading ? <Loader /> : error ? (
        <Message variant="danger">{error?.message || "An error occurred"}</Message>
      ) : (
        <>
          <AdminPaginate page={page} pages={pages} onChange={setPage} />

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Delivered</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                      No orders found
                    </td>
                  </tr>
                ) : orders.map((order) => (
                  <tr key={order._id}>
                    <td><span className="cell-id">{order._id}</span></td>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                      {order.user?.name || "—"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td className="cell-price">R{order.totalPrice}</td>
                    <td>
                      {order.isPaid ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--meka-green)", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          <FaCheckCircle size={11} /> {order.paidAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--bs-danger)", fontSize: "0.82rem" }}>
                          <FaTimesCircle size={11} /> Unpaid
                        </span>
                      )}
                    </td>
                    <td>
                      {order.isDelivered ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--meka-green)", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          <FaCheckCircle size={11} /> {order.deliveredAt.substring(0, 10)}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                          <FaTimesCircle size={11} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <Link to={`/order/${order._id}`} className="admin-action-btn" title="View order">
                        <FaEye size={13} />
                      </Link>
                      <button
                        className="admin-action-btn danger"
                        onClick={() => deleteHandler(order._id)}
                        title="Delete order"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPaginate page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </>
  );
};

export default OrderListScreen;