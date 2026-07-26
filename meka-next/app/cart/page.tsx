"use client"

import Image from "next/image"
import Link from "next/link"

import { useCart } from "@/components/cart/CartProvider"

export default function CartPage() {
  const {
    items,
    subtotal,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const formattedSubtotal = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(subtotal)

  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="text-3xl font-bold text-gray-950">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-600">
            Browse the shop and add something you like.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-950">
              Shopping cart
            </h1>

            <p className="mt-2 text-gray-600">
              Review your products before checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-semibold text-red-600 hover:text-red-700"
          >
            Clear cart
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity

              return (
                <article
                  key={item.productId}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-400">
                        No image
                      </span>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-gray-950 hover:underline"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-1 text-sm text-gray-600">
                        {new Intl.NumberFormat("en-ZA", {
                          style: "currency",
                          currency: "ZAR",
                        }).format(item.price)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center rounded-lg border border-gray-300">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.productId)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="px-3 py-2 text-lg"
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.productId)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                          className="px-3 py-2 text-lg"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-950">
                          {new Intl.NumberFormat("en-ZA", {
                            style: "currency",
                            currency: "ZAR",
                          }).format(itemTotal)}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="mt-1 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-bold text-gray-950">
              Order summary
            </h2>

            <div className="mt-6 flex items-center justify-between border-b border-gray-200 pb-5">
              <span className="text-gray-600">Subtotal</span>

              <span className="font-semibold text-gray-950">
                {formattedSubtotal}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Shipping will be calculated during checkout.
            </p>

            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-300 px-6 py-3 font-semibold text-gray-600"
            >
              Checkout
            </button>

            <Link
              href="/products"
              className="mt-4 block text-center text-sm font-semibold text-gray-700 hover:text-gray-950"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}