import { prisma } from "@/lib/prisma"

export type OrderEmailItem = {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  lineTotal: number
  imageUrl: string | null
}

export type OrderEmailData = {
  id: string
  orderNumber: string

  customer: {
    firstName: string
    lastName: string
    fullName: string
    email: string
    phone: string
  }

  shippingAddress: {
    addressLine1: string
    addressLine2: string | null
    city: string
    province: string
    postalCode: string
  }

  items: OrderEmailItem[]

  subtotal: number
  shipping: number
  total: number

  paymentStatus: string
  orderStatus: string

  createdAt: Date
  confirmationEmailSentAt: Date | null
}

/**
 * Loads and formats all order information needed by
 * transactional emails.
 *
 * Prisma Decimal values are converted into ordinary numbers
 * before being passed into React Email templates.
 */
export async function getOrderForEmail(
  orderId: string
): Promise<OrderEmailData | null> {
  const cleanOrderId = orderId.trim()

  if (!cleanOrderId) {
    throw new Error(
      "A valid order ID is required to load email data."
    )
  }

  const order = await prisma.order.findUnique({
    where: {
      id: cleanOrderId,
    },
    select: {
  id: true,
  orderNumber: true,

  firstName: true,
  lastName: true,
  email: true,
  phone: true,

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
  confirmationEmailSentAt: true,

  items: {
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      productId: true,
      name: true,
      price: true,
      quantity: true,
      imageUrl: true,
    },
  },
},
  })

  if (!order) {
    return null
  }

  const items = order.items.map((item) => {
    const price = Number(item.price)

    return {
      id: item.id,
      productId: item.productId,
      name: item.name,
      price,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
      imageUrl: item.imageUrl,
    }
  })

  return {
    id: order.id,
    orderNumber: order.orderNumber,

    customer: {
      firstName: order.firstName,
      lastName: order.lastName,
      fullName: `${order.firstName} ${order.lastName}`.trim(),
      email: order.email,
      phone: order.phone,
    },

    shippingAddress: {
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      city: order.city,
      province: order.province,
      postalCode: order.postalCode,
    },

    items,

    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),

    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,

    createdAt: order.createdAt,
    confirmationEmailSentAt:
      order.confirmationEmailSentAt,
  }
}