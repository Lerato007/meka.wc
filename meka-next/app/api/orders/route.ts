import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const SHIPPING_FEE = 100
const FREE_SHIPPING_THRESHOLD = 500
const ORDER_RESERVATION_MINUTES = 30

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

type ConsolidatedOrderItem = {
  productId: string
  quantity: number
}

class OrderValidationError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "OrderValidationError"
    this.status = status
  }
}

function createOrderNumber() {
  const date = new Date()

  const datePart = date
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")

  const uniquePart = crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()

  return `MK-${datePart}-${uniquePart}`
}

function isValidText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  )
}

function consolidateOrderItems(
  items: OrderItemInput[]
): ConsolidatedOrderItem[] {
  const quantityByProduct = new Map<string, number>()

  for (const item of items) {
    const currentQuantity =
      quantityByProduct.get(item.productId) ?? 0

    quantityByProduct.set(
      item.productId,
      currentQuantity + item.quantity
    )
  }

  return Array.from(
    quantityByProduct.entries(),
    ([productId, quantity]) => ({
      productId,
      quantity,
    })
  )
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<CreateOrderInput>

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
          message:
            "Please provide all required checkout details.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        {
          status: 400,
        }
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
          message:
            "One or more cart items are invalid.",
        },
        {
          status: 400,
        }
      )
    }

    const validatedOrder: CreateOrderInput = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.replace(/[\s()-]/g, ""),
      addressLine1: body.addressLine1.trim(),
      addressLine2:
        body.addressLine2?.trim() || undefined,
      city: body.city.trim(),
      province: body.province.trim(),
      postalCode: body.postalCode.trim(),
      items: body.items,
    }

    const consolidatedItems =
      consolidateOrderItems(validatedOrder.items)

    const order = await prisma.$transaction(
      async (transaction) => {
        const productIds = consolidatedItems.map(
          (item) => item.productId
        )

        const products =
          await transaction.product.findMany({
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
          throw new OrderValidationError(
            "One or more products are no longer available. Please refresh your cart."
          )
        }

        const productMap = new Map(
          products.map((product) => [
            product.id,
            product,
          ])
        )

        const calculatedItems =
          consolidatedItems.map((item) => {
            const product = productMap.get(
              item.productId
            )

            if (!product) {
              throw new OrderValidationError(
                "One or more products could not be found."
              )
            }

            if (product.stock <= 0) {
              throw new OrderValidationError(
                `${product.name} is currently out of stock.`
              )
            }

            if (item.quantity > product.stock) {
              throw new OrderValidationError(
                `Only ${product.stock} ${
                  product.stock === 1
                    ? "unit"
                    : "units"
                } of ${product.name} ${
                  product.stock === 1
                    ? "is"
                    : "are"
                } available.`
              )
            }

            const price = Number(product.price)

            return {
              productId: product.id,
              name: product.name,
              price,
              quantity: item.quantity,
              imageUrl:
                product.images[0]?.url ?? null,
              lineTotal:
                price * item.quantity,
            }
          })

        const subtotal = calculatedItems.reduce(
          (total, item) =>
            total + item.lineTotal,
          0
        )

        const shipping =
          subtotal >= FREE_SHIPPING_THRESHOLD
            ? 0
            : SHIPPING_FEE

        const total = subtotal + shipping

        /*
         * Atomically decrement each product.
         *
         * The `stock >= quantity` condition protects
         * against another customer purchasing the
         * remaining units at the same time.
         */
        for (const item of calculatedItems) {
          const stockUpdate =
            await transaction.product.updateMany({
              where: {
                id: item.productId,
                stock: {
                  gte: item.quantity,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })

          if (stockUpdate.count !== 1) {
            const latestProduct =
              await transaction.product.findUnique({
                where: {
                  id: item.productId,
                },
                select: {
                  name: true,
                  stock: true,
                },
              })

            if (!latestProduct) {
              throw new OrderValidationError(
                "A product in your cart is no longer available."
              )
            }

            if (latestProduct.stock <= 0) {
              throw new OrderValidationError(
                `${latestProduct.name} has just sold out. Please remove it from your cart.`
              )
            }

            throw new OrderValidationError(
              `Only ${latestProduct.stock} ${
                latestProduct.stock === 1
                  ? "unit"
                  : "units"
              } of ${latestProduct.name} ${
                latestProduct.stock === 1
                  ? "is"
                  : "are"
              } still available.`
            )
          }
        }

        return transaction.order.create({
          data: {
            orderNumber: createOrderNumber(),

            userId: session?.user?.id ?? null,

            firstName: validatedOrder.firstName,
            lastName: validatedOrder.lastName,
            email: validatedOrder.email,
            phone: validatedOrder.phone,

            addressLine1:
              validatedOrder.addressLine1,
            addressLine2:
              validatedOrder.addressLine2 || null,
            city: validatedOrder.city,
            province: validatedOrder.province,
            postalCode: validatedOrder.postalCode,

            subtotal: subtotal.toFixed(2),
            shipping: shipping.toFixed(2),
            total: total.toFixed(2),
            expiresAt: new Date(
  Date.now() + ORDER_RESERVATION_MINUTES * 60 * 1000
),

            items: {
              create: calculatedItems.map(
                (item) => ({
                  productId: item.productId,
                  name: item.name,
                  price: item.price.toFixed(2),
                  quantity: item.quantity,
                  imageUrl: item.imageUrl,
                })
              ),
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
      }
    )

    return NextResponse.json(
      {
        success: true,
        message:
          "Order created successfully.",
        order: {
          ...order,
          total: Number(order.total),
        },
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.status,
        }
      )
    }

    console.error(
      "Failed to create order:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not create your order. Please try again.",
      },
      {
        status: 500,
      }
    )
  }
}