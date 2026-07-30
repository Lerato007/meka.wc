import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendShippedEmail } from "@/lib/email/send"

const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const

type OrderStatus = (typeof ORDER_STATUSES)[number]
type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

type UpdateOrderBody = {
  orderStatus?: unknown
  paymentStatus?: unknown
}

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUSES.includes(value as OrderStatus)
  )
}

function isPaymentStatus(
  value: unknown
): value is PaymentStatus {
  return (
    typeof value === "string" &&
    PAYMENT_STATUSES.includes(value as PaymentStatus)
  )
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorised to update orders.",
        },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const body = (await request.json()) as UpdateOrderBody

    const updateData: {
      orderStatus?: OrderStatus
      paymentStatus?: PaymentStatus
    } = {}

    if (body.orderStatus !== undefined) {
      if (!isOrderStatus(body.orderStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status.",
          },
          { status: 400 }
        )
      }

      updateData.orderStatus = body.orderStatus
    }

    if (body.paymentStatus !== undefined) {
      if (!isPaymentStatus(body.paymentStatus)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment status.",
          },
          { status: 400 }
        )
      }

      updateData.paymentStatus = body.paymentStatus
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No status changes were provided.",
        },
        { status: 400 }
      )
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
        updatedAt: true,
      },
    })

    if (updatedOrder.orderStatus === "SHIPPED") {
  try {
    await sendShippedEmail(updatedOrder.id)
  } catch (error) {
    console.error(
      "Failed to send shipping email:",
      error
    )
  }
}

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Failed to update order:", error)

    return NextResponse.json(
      {
        success: false,
        message: "We could not update the order.",
      },
      { status: 500 }
    )
  }
}