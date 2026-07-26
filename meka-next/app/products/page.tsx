import Image from "next/image"
import Link from "next/link"

import { getCategories } from "@/lib/services/category-service"
import { getProducts } from "@/lib/services/product-service"

type ProductsPageProps = {
  searchParams: Promise<{
    categoryId?: string
  }>
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { categoryId } = await searchParams

  const [products, categories] = await Promise.all([
    getProducts({
      categoryId,
    }),
    getCategories(),
  ])

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950">
            Shop
          </h1>

          <p className="mt-3 text-gray-600">
            Browse our latest collection.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            href="/products"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !categoryId
                ? "bg-gray-950 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-100"
            }`}
          >
            All products
          </Link>

          {categories.map((item) => {
            const isActive = categoryId === item.id

            return (
              <Link
                key={item.id}
                href={`/products?categoryId=${item.id}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-950 text-white"
                    : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-100"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold text-gray-950">
              No products found
            </h2>

            <p className="mt-2 text-gray-600">
              There are currently no products in this category.
            </p>

            {categoryId && (
              <Link
                href="/products"
                className="mt-6 inline-flex rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                View all products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const primaryImage = product.images[0]

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                      {product.category.name}
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-gray-950">
                      {product.name}
                    </h2>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {product.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-950">
                        {new Intl.NumberFormat("en-ZA", {
                          style: "currency",
                          currency: "ZAR",
                        }).format(Number(product.price))}
                      </span>

                      <span className="text-sm font-medium text-gray-700">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}