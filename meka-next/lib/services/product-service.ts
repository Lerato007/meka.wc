import { prisma } from "@/lib/prisma"

export type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"

type GetProductsOptions = {
  categoryId?: string
  search?: string
  sort?: ProductSort
  page?: number
  pageSize?: number
}

export async function countProducts(
  options: Pick<GetProductsOptions, "categoryId" | "search"> = {}
) {
  const { categoryId, search } = options
  const searchTerm = search?.trim()

  return prisma.product.count({
    where: {
      ...(categoryId && {
        categoryId,
      }),

      ...(searchTerm && {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      }),
    },
  })
}

function getProductOrderBy(sort: ProductSort) {
  switch (sort) {
    case "price-asc":
      return {
        price: "asc" as const,
      }

    case "price-desc":
      return {
        price: "desc" as const,
      }

    case "name-asc":
      return {
        name: "asc" as const,
      }

    case "name-desc":
      return {
        name: "desc" as const,
      }

    default:
      return {
        createdAt: "desc" as const,
      }
  }
}

export async function getProducts(
  options: GetProductsOptions = {}
) {
  const {
    categoryId,
    search,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = options

  const searchTerm = search?.trim()

  return prisma.product.findMany({
    skip: (page - 1) * pageSize,
take: pageSize,
    where: {
      ...(categoryId && {
        categoryId,
      }),

      ...(searchTerm && {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive" as const,
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    },

    include: {
      category: true,

      images: {
        orderBy: {
          order: "asc",
        },
      },
    },

    orderBy: getProductOrderBy(sort),
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