import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST() {
  try {
    const now = new Date()

    const expiredOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        expiresAt: {
          lte: now,
        },
        inventoryReleasedAt: null,
      },
      include: {
        items: true,
      },
    })

    if (expiredOrders.length === 0) {
      return NextResponse.json({
        success: true,
        expiredOrders: 0,
      })
    }

    await prisma.$transaction(async (tx) => {
      for (const order of expiredOrders) {
        for (const item of order.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          })
        }

        await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentStatus: "EXPIRED",
            orderStatus: "EXPIRED",
            inventoryReleasedAt: now,
          },
        })
      }
    })

    return NextResponse.json({
      success: true,
      expiredOrders: expiredOrders.length,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to expire orders.",
      },
      {
        status: 500,
      }
    )
  }
}