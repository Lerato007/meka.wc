import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getUserWishlist } from "@/lib/services/wishlist-service"
import RemoveWishlistButton from "@/components/wishlist/RemoveWishlistButton"

export default async function WishlistPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const wishlist = await getUserWishlist(session.user.id)

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-950">
            My Wishlist
          </h1>

          <p className="mt-2 text-gray-600">
            Products you've saved for later.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-gray-200">
            <h2 className="text-2xl font-semibold text-gray-950">
              Your wishlist is empty
            </h2>

            <p className="mt-3 text-gray-600">
              Browse our products and save the ones you love.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {wishlist.map((item) => {
              const product = item.product
              const image = product.images[0]

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 md:flex-row md:items-center"
                >
                  <div className="relative h-36 w-36 overflow-hidden rounded-xl bg-gray-100">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.alt ?? product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-wide text-gray-500">
                      {product.category.name}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-950">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-xl font-semibold">
                      {new Intl.NumberFormat("en-ZA", {
                        style: "currency",
                        currency: "ZAR",
                      }).format(Number(product.price))}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
  <Link
    href={`/products/${product.slug}`}
    className="rounded-xl bg-gray-950 px-6 py-3 text-center font-semibold text-white hover:bg-gray-800"
  >
    View Product
  </Link>

  <RemoveWishlistButton
    productId={product.id}
  />
</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}