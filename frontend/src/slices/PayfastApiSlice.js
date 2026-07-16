import { apiSlice } from "./apiSlice";
import { PAYFAST_URL } from "../constants";

export const payfastApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPayfastIdentifier: builder.mutation({
      query: (orderId) => ({
        url:    `${PAYFAST_URL}/onsite/${orderId}`,
        method: "POST",
      }),
    }),
  }),
});

export const { useCreatePayfastIdentifierMutation } = payfastApiSlice;