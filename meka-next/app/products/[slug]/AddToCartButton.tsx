"use client"

import { useState } from "react"

import { useCart } from "@/components/cart/CartProvider"

type AddToCartButtonProps = {
  product: {
    id: string
    name: string
    slug: string
    price: number
    imageUrl: string | null
    stock: number
  }
}

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    if (product.stock <= 0) {
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    })

    setAdded(true)

    window.setTimeout(() => {
      setAdded(false)
    }, 1500)
  }

  const outOfStock = product.stock <= 0

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={outOfStock}
      className={`w-full rounded-xl px-6 py-3 font-semibold transition ${
        outOfStock
          ? "cursor-not-allowed bg-gray-300 text-gray-600"
          : "bg-gray-950 text-white hover:bg-gray-800"
      }`}
    >
      {outOfStock
        ? "Out of stock"
        : added
          ? "Added to cart"
          : "Add to cart"}
    </button>
  )
}