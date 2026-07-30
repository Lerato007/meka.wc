import { resend } from "@/lib/email/resend"
import { getOrderForEmail } from "@/lib/email/order"
import ShippedEmail from "@/lib/email/templates/shipped"
import { prisma } from "@/lib/prisma"

type SendShippedEmailResult =
  | {
      success: true
      skipped: false
      emailId: string | null
    }
  | {
      success: true
      skipped: true
      reason:
        | "ORDER_NOT_SHIPPED"
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

export async function sendShippedEmail(
  orderId: string
): Promise<SendShippedEmailResult> {
  const order = await getOrderForEmail(orderId)

  if (!order) {
    throw new Error(
      `Cannot send shipping email. Order ${orderId} was not found.`
    )
  }

  if (order.orderStatus !== "SHIPPED") {
    console.log(
      `Shipping email skipped for ${order.orderNumber}: order status is ${order.orderStatus}.`
    )

    return {
      success: true,
      skipped: true,
      reason: "ORDER_NOT_SHIPPED",
    }
  }

  if (order.shippedEmailSentAt) {
    console.log(
      `Shipping email already sent for ${order.orderNumber}.`
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
    subject: `Your order has been shipped: ${order.orderNumber}`,
    react: (
      <ShippedEmail
        order={order}
        orderUrl={`${appUrl}/orders/${order.orderNumber}`}
      />
    ),
  })

  if (error) {
    throw new Error(
      `Resend failed to send shipping email: ${error.message}`
    )
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      shippedEmailSentAt: new Date(),
    },
  })

  console.log(
    `Shipping email sent for ${order.orderNumber}.`,
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