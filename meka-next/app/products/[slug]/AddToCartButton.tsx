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
  }
}

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
    })

    setAdded(true)

    window.setTimeout(() => {
      setAdded(false)
    }, 1500)
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="w-full rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  )
}