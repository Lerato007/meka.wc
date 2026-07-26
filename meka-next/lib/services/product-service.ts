import { prisma } from "@/lib/prisma"

type GetProductsOptions = {
  categoryId?: string
}

export async function getProducts(
  options: GetProductsOptions = {}
) {
  const { categoryId } = options

  return prisma.product.findMany({
    where: categoryId
      ? {
          categoryId,
        }
      : undefined,
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
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  })
}