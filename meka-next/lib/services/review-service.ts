import { prisma } from "@/lib/prisma"

export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getAverageRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: {
      productId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  })

  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  }
}

export async function getUserReview(
  userId: string,
  productId: string
) {
  return prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  })
}

export async function createReview(
  userId: string,
  productId: string,
  rating: number,
  comment: string
) {
  return prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
  })
}

export async function updateReview(
  userId: string,
  productId: string,
  rating: number,
  comment: string
) {
  return prisma.review.update({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    data: {
      rating,
      comment,
    },
  })
}

export async function deleteReview(
  userId: string,
  productId: string
) {
  return prisma.review.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  })
}

export async function canUserReviewProduct(
  userId: string,
  productId: string
) {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      items: {
        some: {
          productId,
        },
      },
    },
    select: {
      id: true,
    },
  })

  return Boolean(order)
}