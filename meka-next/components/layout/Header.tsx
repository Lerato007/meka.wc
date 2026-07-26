"use client"

import Link from "next/link"

import { useCart } from "@/components/cart/CartProvider"

export default function Header() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          Meka.WC
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="transition hover:text-gray-600"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="transition hover:text-gray-600"
          >
            Shop
          </Link>

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
        </nav>
      </div>
    </header>
  )
}