import Image from "next/image"
import Link from "next/link"

import { auth } from "@/auth"
import RemoveWishlistButton from "@/components/wishlist/RemoveWishlistButton"
import { getUserWishlist } from "@/lib/services/wishlist-service"

export default async function AccountWishlistPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const wishlist = await getUserWishlist(
    session.user.id
  )

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          My account
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Wishlist
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Products you have saved for later.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-950">
            Your wishlist is empty
          </h2>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Browse the shop and save products you may want to
            purchase later.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {wishlist.map((item) => {
            const product = item.product
            const image = product.images[0]
            const isOutOfStock = product.stock <= 0

            const formattedPrice =
              new Intl.NumberFormat("en-ZA", {
                style: "currency",
                currency: "ZAR",
              }).format(Number(product.price))

            return (
              <article
                key={item.id}
                className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-neutral-100 md:h-36 md:w-36"
                >
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt ?? product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 144px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                      No image
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
                    {product.category.name}
                  </p>

                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-2 block text-2xl font-semibold text-neutral-950 hover:underline"
                  >
                    {product.name}
                  </Link>

                  <p className="mt-3 text-lg font-semibold text-neutral-950">
                    {formattedPrice}
                  </p>

                  <div className="mt-3">
                    {isOutOfStock ? (
                      <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        In stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 md:w-44">
                  <Link
                    href={`/products/${product.slug}`}
                    className="rounded-xl bg-neutral-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    View product
                  </Link>

                  <RemoveWishlistButton
                    productId={product.id}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}