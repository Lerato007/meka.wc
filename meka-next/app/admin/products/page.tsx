import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import DeleteProductButton from "@/app/admin/products/DeleteProductButton"

export default async function AdminProductsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/products")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Meka WC administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
              Products
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Manage the products currently available in your store.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Back to dashboard
            </Link>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Add product
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-950">
                No products found
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Create your first product to start populating the store.
              </p>

              <Link
                href="/admin/products/new"
                className="mt-6 inline-flex rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Add first product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Product
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Created
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => {
                    const primaryImage = product.images[0]

                    return (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                              {primaryImage ? (
                                <Image
                                  src={primaryImage.url}
                                  alt={primaryImage.alt || product.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                  No image
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-medium text-gray-950">
                                {product.name}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                /products/{product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                          {product.category.name}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-950">
                          {new Intl.NumberFormat("en-ZA", {
                            style: "currency",
                            currency: "ZAR",
                          }).format(Number(product.price))}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {new Intl.DateTimeFormat("en-ZA", {
                            dateStyle: "medium",
                          }).format(product.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-4">
  <Link
    href={`/products/${product.slug}`}
    className="font-medium text-gray-600 hover:text-gray-950"
  >
    View
  </Link>

  <Link
    href={`/admin/products/${product.id}/edit`}
    className="font-medium text-gray-950 hover:underline"
  >
    Edit
  </Link>

  <DeleteProductButton
  productId={product.id}
  productName={product.name}
/>
</div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}