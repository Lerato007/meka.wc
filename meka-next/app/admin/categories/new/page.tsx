import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"

import CategoryForm from "../CategoryForm"

export default async function NewCategoryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/categories/new")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
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
            Add category
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Create a category that can be assigned to products.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          <CategoryForm />
        </div>
      </section>
    </main>
  )
}