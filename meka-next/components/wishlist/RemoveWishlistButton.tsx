"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type RemoveWishlistButtonProps = {
  productId: string
}

export default function RemoveWishlistButton({
  productId,
}: RemoveWishlistButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function removeFromWishlist() {
    if (loading) return

    setLoading(true)

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      })

      if (!response.ok) {
        return
      }

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={removeFromWishlist}
      disabled={loading}
      className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  )
}