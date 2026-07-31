import { resend } from "@/lib/email/resend"
import { prisma } from "@/lib/prisma"
import NewOrderAdminEmail from "@/lib/email/templates/new-order-admin"

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export async function sendNewOrderAdminEmail(orderId: string) {
  const storeOwnerEmail =
    getRequiredEnvironmentVariable("STORE_OWNER_EMAIL")

  const emailFrom =
    getRequiredEnvironmentVariable("EMAIL_FROM")

  const appUrl =
    getRequiredEnvironmentVariable("APP_URL").replace(/\/$/, "")

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
    },
  })

  if (!order) {
    throw new Error(`Order ${orderId} was not found.`)
  }

  if (order.adminNotificationSentAt) {
    console.log(
      `Admin notification already sent for order ${order.orderNumber}.`
    )

    return
  }

  const customerName =
    `${order.firstName} ${order.lastName}`.trim()

  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const orderUrl =
    `${appUrl}/admin/orders/${order.id}`

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: storeOwnerEmail,
    subject: `New order received - ${order.orderNumber}`,
    react: NewOrderAdminEmail({
      orderNumber: order.orderNumber,
      customerName,
      customerEmail: order.email,
      itemCount,
      total: `R${Number(order.total).toFixed(2)}`,
      paymentStatus: order.paymentStatus,
      orderUrl,
    }),
  })

  if (error) {
    throw new Error(
      `Resend failed to send the admin notification: ${error.message}`
    )
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      adminNotificationSentAt: new Date(),
    },
  })

  console.log(
    `Admin notification sent successfully for order ${order.orderNumber}.`
  )
}