"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { useCart } from "@/components/cart/CartProvider"

export default function CartButton() {
  const { itemCount } = useCart()

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900"
      aria-label={`Shopping cart${
        itemCount > 0 ? ` with ${itemCount} items` : ""
      }`}
    >
      <ShoppingCart className="h-5 w-5" />

      <span>Cart</span>

      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs font-semibold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  )
}