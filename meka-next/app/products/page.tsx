import Image from "next/image"
import Link from "next/link"

import { getCategories } from "@/lib/services/category-service"
import {
  countProducts,
  getProducts,
  type ProductSort,
} from "@/lib/services/product-service"

type ProductsPageProps = {
  searchParams: Promise<{
    categoryId?: string
    search?: string
    sort?: string
    page?: string
  }>
}

const validSortOptions: ProductSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
]

function getSortValue(value?: string): ProductSort {
  if (
    value &&
    validSortOptions.includes(value as ProductSort)
  ) {
    return value as ProductSort
  }

  return "newest"
}

function createProductsUrl({
  categoryId,
  search,
  sort,
  page,
}: {
  categoryId?: string
  search?: string
  sort?: ProductSort
  page?: number
}) {
  const params = new URLSearchParams()

  if (categoryId) {
    params.set("categoryId", categoryId)
  }

  if (search?.trim()) {
    params.set("search", search.trim())
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort)
  }

  if (page && page > 1) {
    params.set("page", String(page))
  }

  const queryString = params.toString()

  return queryString
    ? `/products?${queryString}`
    : "/products"
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const {
    categoryId,
    search,
    sort: rawSort,
    page: rawPage,
  } = await searchParams

  const sort = getSortValue(rawSort)
  const parsedPage = Number(rawPage)
  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1
  const pageSize = 12

  const [products, totalProducts, categories] =
    await Promise.all([
      getProducts({
        categoryId,
        search,
        sort,
        page: currentPage,
        pageSize,
      }),
      countProducts({
        categoryId,
        search,
      }),
      getCategories(),
    ])

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / pageSize)
  )

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

          <form
            action="/products"
            className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]"
          >
            {categoryId && (
              <input
                type="hidden"
                name="categoryId"
                value={categoryId}
              />
            )}

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search products..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-gray-950 focus:outline-none"
            />

            <select
              name="sort"
              defaultValue={sort}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-gray-950 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">
                Price: Low to High
              </option>
              <option value="price-desc">
                Price: High to Low
              </option>
              <option value="name-asc">
                Name: A to Z
              </option>
              <option value="name-desc">
                Name: Z to A
              </option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Apply
            </button>
          </form>

          {(search || categoryId || sort !== "newest") && (
            <Link
              href="/products"
              className="mt-3 inline-flex text-sm font-semibold text-gray-600 hover:text-gray-950 hover:underline"
            >
              Clear filters
            </Link>
          )}
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            href={createProductsUrl({
              search,
              sort,
            })}
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
                href={createProductsUrl({
                  categoryId: item.id,
                  search,
                  sort,
                })}
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
              {search
                ? `No products found for "${search}".`
                : "There are currently no products in this category."}
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              View all products
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-gray-600">
              {totalProducts}{" "}
              {totalProducts === 1
                ? "product"
                : "products"}{" "}
              found
            </p>

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
                          alt={
                            primaryImage.alt ||
                            product.name
                          }
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
                          {new Intl.NumberFormat(
                            "en-ZA",
                            {
                              style: "currency",
                              currency: "ZAR",
                            }
                          ).format(
                            Number(product.price)
                          )}
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

            {totalPages > 1 && (
              <nav
                aria-label="Product pagination"
                className="mt-12 flex flex-wrap items-center justify-center gap-2"
              >
                {currentPage > 1 && (
                  <Link
                    href={createProductsUrl({
                      categoryId,
                      search,
                      sort,
                      page: currentPage - 1,
                    })}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-950"
                  >
                    ← Previous
                  </Link>
                )}

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={createProductsUrl({
                      categoryId,
                      search,
                      sort,
                      page: pageNumber,
                    })}
                    aria-current={
                      pageNumber === currentPage
                        ? "page"
                        : undefined
                    }
                    className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                      pageNumber === currentPage
                        ? "bg-gray-950 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:border-gray-950"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                {currentPage < totalPages && (
                  <Link
                    href={createProductsUrl({
                      categoryId,
                      search,
                      sort,
                      page: currentPage + 1,
                    })}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-950"
                  >
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  )
}