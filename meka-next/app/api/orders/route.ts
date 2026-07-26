import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const SHIPPING_FEE = 100
const FREE_SHIPPING_THRESHOLD = 500

type OrderItemInput = {
  productId: string
  quantity: number
}

type CreateOrderInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  items: OrderItemInput[]
}

function createOrderNumber() {
  const date = new Date()
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "")
  const uniquePart = crypto.randomUUID().slice(0, 8).toUpperCase()

  return `MK-${datePart}-${uniquePart}`
}

function isValidText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateOrderInput>

    const session = await auth()
    if (
      !isValidText(body.firstName) ||
      !isValidText(body.lastName) ||
      !isValidText(body.email) ||
      !isValidText(body.phone) ||
      !isValidText(body.addressLine1) ||
      !isValidText(body.city) ||
      !isValidText(body.province) ||
      !isValidText(body.postalCode)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required checkout details.",
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      )
    }

    const invalidItem = body.items.some(
      (item) =>
        !isValidText(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    )

    if (invalidItem) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more cart items are invalid.",
        },
        { status: 400 }
      )
    }

    const productIds = [...new Set(body.items.map((item) => item.productId))]

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
          take: 1,
        },
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products are no longer available. Please refresh your cart.",
        },
        { status: 400 }
      )
    }

    const productMap = new Map(
      products.map((product) => [product.id, product])
    )

    const calculatedItems = body.items.map((item) => {
      const product = productMap.get(item.productId)

      if (!product) {
        throw new Error(`Product ${item.productId} could not be found.`)
      }

      const price = Number(product.price)

      return {
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
        imageUrl: product.images[0]?.url ?? null,
        lineTotal: price * item.quantity,
      }
    })

    const subtotal = calculatedItems.reduce(
      (total, item) => total + item.lineTotal,
      0
    )

    const shipping =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

    const total = subtotal + shipping

    const order = await prisma.order.create({
      data: {
        orderNumber: createOrderNumber(),

        userId: session?.user?.id || null,
        
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.replace(/[\s()-]/g, ""),

        addressLine1: body.addressLine1.trim(),
        addressLine2: body.addressLine2?.trim() || null,
        city: body.city.trim(),
        province: body.province.trim(),
        postalCode: body.postalCode.trim(),

        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),

        items: {
          create: calculatedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price.toFixed(2),
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentStatus: true,
        orderStatus: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        order: {
          ...order,
          total: Number(order.total),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create order:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not create your order. Please try again.",
      },
      { status: 500 }
    )
  }
}