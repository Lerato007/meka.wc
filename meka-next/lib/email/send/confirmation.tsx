import { resend } from "@/lib/email/resend"
import { getOrderForEmail } from "@/lib/email/order"
import OrderConfirmationEmail from "@/lib/email/templates/order-confirmation"
import { prisma } from "@/lib/prisma"

type SendOrderConfirmationResult =
  | {
      success: true
      skipped: false
      emailId: string | null
    }
  | {
      success: true
      skipped: true
      reason:
        | "ORDER_NOT_PAID"
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

export async function sendOrderConfirmation(
  orderId: string
): Promise<SendOrderConfirmationResult> {
  const order = await getOrderForEmail(orderId)

  if (!order) {
    throw new Error(
      `Cannot send confirmation email. Order ${orderId} was not found.`
    )
  }

  if (order.paymentStatus !== "PAID") {
    console.log(
      `Confirmation email skipped for ${order.orderNumber}: payment status is ${order.paymentStatus}.`
    )

    return {
      success: true,
      skipped: true,
      reason: "ORDER_NOT_PAID",
    }
  }

  if (order.confirmationEmailSentAt) {
    console.log(
      `Confirmation email already sent for ${order.orderNumber}.`
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
    subject: `Order confirmed: ${order.orderNumber}`,
    react: (
      <OrderConfirmationEmail
        order={order}
        orderUrl={`${appUrl}/orders/${order.orderNumber}`}
      />
    ),
  })

  if (error) {
    throw new Error(
      `Resend failed to send order confirmation: ${error.message}`
    )
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      confirmationEmailSentAt: new Date(),
    },
  })

  console.log(
    `Confirmation email sent for ${order.orderNumber}.`,
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