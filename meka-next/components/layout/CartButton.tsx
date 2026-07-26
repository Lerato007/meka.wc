"use client"

import Link from "next/link"

import { useCart } from "@/components/cart/CartProvider"

export default function CartButton() {
  const { itemCount } = useCart()

  return (
    <Link
      href="/cart"
      className="relative transition hover:text-gray-600"
    >
      Cart

      {itemCount > 0 && (
        <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
          {itemCount}
        </span>
      )}
    </Link>
  )
}