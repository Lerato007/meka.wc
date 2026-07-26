import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  createPayFastPaymentData,
  getPayFastProcessUrl,
} from "@/lib/payfast"

type CreatePaymentBody = {
  orderId?: unknown
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentBody

    if (
      typeof body.orderId !== "string" ||
      !body.orderId.trim()
    ) {
    
      return NextResponse.json(
        {
          success: false,
          message: "A valid order ID is required.",
        },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: {
        id: body.orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        total: true,
        paymentStatus: true,
        orderStatus: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      )
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: false,
          message: "This order has already been paid.",
        },
        { status: 400 }
      )
    }

    if (order.orderStatus === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "A cancelled order cannot be paid.",
        },
        { status: 400 }
      )
    }

    const paymentData = createPayFastPaymentData({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      firstName: order.firstName,
      lastName: order.lastName,
      email: order.email,
      phone: order.phone,
    })

    return NextResponse.json({
      success: true,
      processUrl: getPayFastProcessUrl(),
      paymentData,
    })
  } catch (error) {
    console.error("Failed to create PayFast payment:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not prepare your payment. Please try again.",
      },
      { status: 500 }
    )
  }
}