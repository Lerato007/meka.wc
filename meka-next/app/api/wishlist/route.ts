import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  getUserWishlist,
  toggleWishlistProduct,
} from "@/lib/services/wishlist-service"

type WishlistRequestBody = {
  productId?: string
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to view your wishlist.",
        },
        {
          status: 401,
        }
      )
    }

    const wishlist = await getUserWishlist(session.user.id)

    return NextResponse.json({
      success: true,
      wishlist,
    })
  } catch (error) {
    console.error("Failed to retrieve wishlist:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve your wishlist.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to update your wishlist.",
        },
        {
          status: 401,
        }
      )
    }

    const body = (await request.json()) as WishlistRequestBody
    const productId = body.productId?.trim()

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      )
    }

    const result = await toggleWishlistProduct(
      session.user.id,
      productId
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Failed to update wishlist:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your wishlist.",
      },
      {
        status: 500,
      }
    )
  }
}