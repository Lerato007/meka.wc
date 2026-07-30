import { render } from "@react-email/render"
import { NextResponse } from "next/server"

import { getOrderForEmail } from "@/lib/email/order"
import OrderConfirmationEmail from "@/lib/email/templates/order-confirmation"

export const runtime = "nodejs"

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", {
      status: 404,
    })
  }

  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get("orderId")?.trim()

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Add an orderId query parameter.",
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

    const appUrl =
      process.env.APP_URL?.trim() ||
      "http://localhost:3000"

    const html = await render(
      <OrderConfirmationEmail
        order={order}
        orderUrl={`${appUrl}/account/orders/${order.id}`}
      />
    )

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error(
      "Order confirmation template test failed:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to render the email template.",
      },
      { status: 500 }
    )
  }
}