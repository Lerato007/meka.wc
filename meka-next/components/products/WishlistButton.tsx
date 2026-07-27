"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type WishlistButtonProps = {
  productId: string;
  initialWishlisted?: boolean;
};

export default function WishlistButton({
  productId,
  initialWishlisted = false,
}: WishlistButtonProps) {
  const router = useRouter();

  const [wishlisted, setWishlisted] =
    useState(initialWishlisted);

  const [loading, setLoading] = useState(false);

  async function toggleWishlist() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const result = await response.json();

      if (result.success) {
        setWishlisted(result.wishlisted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
  type="button"
  onClick={(event) => {
    event.preventDefault()
    event.stopPropagation()
    void toggleWishlist()
  }}
  disabled={loading}
  aria-label={
    wishlisted
      ? "Remove from wishlist"
      : "Add to wishlist"
  }
  aria-pressed={wishlisted}
  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-2xl shadow-sm transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
>
  {wishlisted ? "❤️" : "🤍"}
</button>
  );
}