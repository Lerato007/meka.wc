import { NextResponse } from "next/server"

import { getOrderForEmail } from "@/lib/email/order"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        message:
          "This development test route is disabled in production.",
      },
      { status: 404 }
    )
  }

  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get("orderId")?.trim()

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Add an orderId query parameter to the request.",
          example:
            "/api/email/order-data-test?orderId=your-order-id",
        },
        { status: 400 }
      )
    }

    const order = await getOrderForEmail(orderId)

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error(
      "Order email data test failed:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load order email data.",
      },
      { status: 500 }
    )
  }
}