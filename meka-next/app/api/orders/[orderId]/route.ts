import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

type OrderRouteProps = {
  params: Promise<{
    orderId: string
  }>
}

export async function GET(
  _request: Request,
  { params }: OrderRouteProps
) {
  try {
    const { orderId } = await params

    if (!orderId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid order ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        province: true,
        postalCode: true,
        subtotal: true,
        shipping: true,
        total: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        total: Number(order.total),
      },
    })
  } catch (error) {
    console.error("Failed to retrieve order:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not retrieve the order. Please try again.",
      },
      {
        status: 500,
      }
    )
  }
}