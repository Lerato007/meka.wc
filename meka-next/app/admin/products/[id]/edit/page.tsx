import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import AddProductImagesForm from "@/app/admin/products/AddProductImagesForm"
import ImageGallery from "@/app/admin/products/ImageGallery"
import ProductForm from "@/app/admin/products/ProductForm"

type EditProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/products")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        lowStockThreshold: true,
        categoryId: true,
        images: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            url: true,
            alt: true,
            order: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-950"
          >
            ← Back to products
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
            Edit product
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Update the information for {product.name}.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          <div className="space-y-10">
            <ImageGallery images={product.images} />

            <AddProductImagesForm
              productId={product.id}
              currentImageCount={product.images.length}
            />

            <ProductForm
              categories={categories}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price.toString(),
                stock: product.stock,
                lowStockThreshold: product.lowStockThreshold,
                categoryId: product.categoryId,
              }}
            />
          </div>
        </div>
      </section>
    </main>
  )
}