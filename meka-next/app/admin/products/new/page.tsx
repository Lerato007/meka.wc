import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ProductForm from "../ProductForm"

export default async function NewProductPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/products/new")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Meka WC administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
              Add product
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Create a new product for your online store.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          {categories.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Create at least one category before adding a product.
            </div>
          ) : (
            <ProductForm categories={categories} />
          )}
        </div>
      </section>
    </main>
  )
}