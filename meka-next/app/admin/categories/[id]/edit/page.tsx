import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import EditCategoryForm from "@/app/admin/categories/EditCategoryForm"
import DeleteCategoryButton from "@/app/admin/categories/DeleteCategoryButton"

type EditCategoryPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/categories")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const { id } = await params

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  if (!category) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="text-sm font-medium text-gray-600 hover:text-gray-950"
          >
            ← Back to categories
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
            Edit category
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            This category currently contains{" "}
            {category._count.products}{" "}
            {category._count.products === 1
              ? "product"
              : "products"}
            .
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          <EditCategoryForm
            category={{
              id: category.id,
              name: category.name,
            }}
          />

          <div className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-950">
    Delete category
  </h2>

  <p className="mt-2 text-sm text-gray-600">
    Categories containing products cannot be deleted.
  </p>

  <DeleteCategoryButton
    category={{
      id: category.id,
      name: category.name,
      productCount: category._count.products,
    }}
  />
</div>
        </div>
      </section>
    </main>
  )
}