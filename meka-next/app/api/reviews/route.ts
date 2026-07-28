import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import {
  canUserReviewProduct,
  createReview,
  getProductReviews,
  getUserReview,
  updateReview,
} from "@/lib/services/review-service"

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId")

  if (!productId) {
    return NextResponse.json(
      { message: "Product ID is required." },
      { status: 400 }
    )
  }

  const reviews = await getProductReviews(productId)

  return NextResponse.json(reviews)
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  const { productId, rating, comment } = await request.json()

  if (!productId || !rating || !comment) {
    return NextResponse.json(
      { message: "Missing required fields." },
      { status: 400 }
    )
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "Rating must be between 1 and 5." },
      { status: 400 }
    )
  }

  const canReview = await canUserReviewProduct(
    session.user.id,
    productId
  )

  if (!canReview) {
    return NextResponse.json(
      {
        message:
          "Only customers who purchased this product can review it.",
      },
      { status: 403 }
    )
  }

  const existingReview = await getUserReview(
    session.user.id,
    productId
  )

  if (existingReview) {
    await updateReview(
      session.user.id,
      productId,
      rating,
      comment
    )

    return NextResponse.json({
      success: true,
      updated: true,
    })
  }

  await createReview(
    session.user.id,
    productId,
    rating,
    comment
  )

  return NextResponse.json({
    success: true,
    created: true,
  })
}