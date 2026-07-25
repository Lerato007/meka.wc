import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export default async function AdminCategoriesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/categories")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Meka WC administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
              Categories
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Organise products into store categories.
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
              href="/admin/categories/new"
              className="inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Add category
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          {categories.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-950">
                No categories found
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Create your first category before adding products.
              </p>

              <Link
                href="/admin/categories/new"
                className="mt-6 inline-flex rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Add first category
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Products
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
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-950">
                          {category.name}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {category._count.products}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {new Intl.DateTimeFormat("en-ZA", {
                          dateStyle: "medium",
                        }).format(category.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-sm font-medium text-gray-950 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}