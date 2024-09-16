import React, { useState } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Table, Button, Pagination } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { useGetOrdersQuery } from "../../slices/ordersApiSlice";

const OrderListScreen = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10; // Number of orders per page

  // Fetch orders with pagination
  const { data, isLoading, error } = useGetOrdersQuery({ page, pageSize });

  // Destructure orders and pages from the data
  const orders = data?.orders || [];
  const pages = data?.pages || 1;

  return (
    <>
      <h1>Orders</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error.message || 'An error occurred'}</Message>
      ) : (
        <>
        {/* Pagination Controls */}
        <Pagination>
            <Pagination.Prev
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            />
            {[...Array(pages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === page}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
              disabled={page === pages}
            />
          </Pagination>
          <Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.user && order.user.name}</td>
                    <td>{order.createdAt.substring(0, 10)}</td>
                    <td>R{order.totalPrice}</td>
                    <td>
                      {order.isPaid ? (
                        order.paidAt.substring(0, 10)
                      ) : (
                        <FaTimes style={{ color: "red" }} />
                      )}
                    </td>
                    <td>
                      {order.isDelivered ? (
                        order.deliveredAt.substring(0, 10)
                      ) : (
                        <FaTimes style={{ color: "red" }} />
                      )}
                    </td>
                    <td>
                      <LinkContainer to={`/order/${order._id}`}>
                        <Button variant="light" className="btn-sm">
                          Details
                        </Button>
                      </LinkContainer>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No orders found</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination Controls */}
          <Pagination>
            <Pagination.Prev
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            />
            {[...Array(pages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === page}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
              disabled={page === pages}
            />
          </Pagination>
        </>
      )}
    </>
  );
};

export default OrderListScreen;
