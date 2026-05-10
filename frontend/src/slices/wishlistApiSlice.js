import { apiSlice } from "./apiSlice";

const WISHLIST_URL = "/api/wishlist";

export const wishlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Get full wishlist with populated product details
    getWishlist: builder.query({
      query: () => ({
        url: WISHLIST_URL,
      }),
      providesTags: ["Wishlist"],
      keepUnusedDataFor: 30,
    }),

    // Check if a single product is wishlisted
    checkWishlist: builder.query({
      query: (productId) => ({
        url: `${WISHLIST_URL}/${productId}`,
      }),
      providesTags: (result, error, productId) => [
        { type: "Wishlist", id: productId },
      ],
      keepUnusedDataFor: 30,
    }),

    // Add product to wishlist
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url:    `${WISHLIST_URL}/${productId}`,
        method: "POST",
      }),
      // Invalidate so getWishlist and checkWishlist both refetch
      invalidatesTags: (result, error, productId) => [
        "Wishlist",
        { type: "Wishlist", id: productId },
      ],
    }),

    // Remove product from wishlist
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url:    `${WISHLIST_URL}/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, productId) => [
        "Wishlist",
        { type: "Wishlist", id: productId },
      ],
    }),

  }),
});

export const {
  useGetWishlistQuery,
  useCheckWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApiSlice;