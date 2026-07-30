import { resend } from "@/lib/email/resend"
import { getOrderForEmail } from "@/lib/email/order"
import DeliveredEmail from "@/lib/email/templates/delivered"
import { prisma } from "@/lib/prisma"

type SendDeliveredEmailResult =
  | {
      success: true
      skipped: false
      emailId: string | null
    }
  | {
      success: true
      skipped: true
      reason:
        | "ORDER_NOT_DELIVERED"
        | "ALREADY_SENT"
    }

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    )
  }

  return value
}

export async function sendDeliveredEmail(
  orderId: string
): Promise<SendDeliveredEmailResult> {
  const order = await getOrderForEmail(orderId)

  if (!order) {
    throw new Error(
      `Cannot send delivery email. Order ${orderId} was not found.`
    )
  }

  if (order.orderStatus !== "DELIVERED") {
    console.log(
      `Delivery email skipped for ${order.orderNumber}: order status is ${order.orderStatus}.`
    )

    return {
      success: true,
      skipped: true,
      reason: "ORDER_NOT_DELIVERED",
    }
  }

  if (order.deliveredEmailSentAt) {
    console.log(
      `Delivery email already sent for ${order.orderNumber}.`
    )

    return {
      success: true,
      skipped: true,
      reason: "ALREADY_SENT",
    }
  }

  const emailFrom =
    getRequiredEnvironmentVariable("EMAIL_FROM")

  const appUrl =
    getRequiredEnvironmentVariable("APP_URL").replace(
      /\/$/,
      ""
    )

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: order.customer.email,
    subject: `Your order has been delivered: ${order.orderNumber}`,
    react: (
      <DeliveredEmail
        order={order}
        orderUrl={`${appUrl}/orders/${order.orderNumber}`}
      />
    ),
  })

  if (error) {
    throw new Error(
      `Resend failed to send delivery email: ${error.message}`
    )
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      deliveredEmailSentAt: new Date(),
    },
  })

  console.log(
    `Delivery email sent for ${order.orderNumber}.`,
    {
      emailId: data?.id ?? null,
      recipient: order.customer.email,
    }
  )

  return {
    success: true,
    skipped: false,
    emailId: data?.id ?? null,
  }
}