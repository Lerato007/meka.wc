import { apiSlice } from "./apiSlice";
import { ORDERS_URL } from "../constants";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    createOrder: builder.mutation({
      query: (order) => ({
        url:    ORDERS_URL,
        method: "POST",
        body:   { ...order },
      }),
    }),

    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
      }),
      keepUnusedDataFor: 5,
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),

    getOrders: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url:    ORDERS_URL,
        params: { page, pageSize },
      }),
      keepUnusedDataFor: 5,
    }),

    updateOrderStatus: builder.mutation({
      query: ({ orderId, status, note, trackingNumber }) => ({
        url:    `${ORDERS_URL}/${orderId}/status`,
        method: "PUT",
        body:   { status, note, trackingNumber },
      }),
    }),

    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url:    `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body:   { ...details },
      }),
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url:    `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
    }),

    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url:    `${ORDERS_URL}/${orderId}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  usePayOrderMutation,
  useDeliverOrderMutation,
  useDeleteOrderMutation,
} = ordersApiSlice;