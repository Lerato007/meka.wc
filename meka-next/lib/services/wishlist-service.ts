import { prisma } from "@/lib/prisma"

export async function getUserWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: {
      userId,
    },

    include: {
      product: {
        include: {
          category: true,

          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getWishlistProductIds(
  userId: string
) {
  const items = await prisma.wishlist.findMany({
    where: {
      userId,
    },
    select: {
      productId: true,
    },
  })

  return new Set(
    items.map((item) => item.productId)
  )
}

export async function isProductInWishlist(
  userId: string,
  productId: string
) {
  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },

    select: {
      id: true,
    },
  })

  return Boolean(wishlistItem)
}

export async function addProductToWishlist(
  userId: string,
  productId: string
) {
  return prisma.wishlist.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },

    update: {},

    create: {
      userId,
      productId,
    },
  })
}

export async function removeProductFromWishlist(
  userId: string,
  productId: string
) {
  return prisma.wishlist.deleteMany({
    where: {
      userId,
      productId,
    },
  })
}

export async function toggleWishlistProduct(
  userId: string,
  productId: string
) {
  const existingItem = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },

    select: {
      id: true,
    },
  })

  if (existingItem) {
    await removeProductFromWishlist(userId, productId)

    return {
      wishlisted: false,
      message: "Removed from wishlist",
    }
  }

  await addProductToWishlist(userId, productId)

  return {
    wishlisted: true,
    message: "Added to wishlist",
  }
}

