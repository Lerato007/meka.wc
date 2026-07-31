import { createHash } from "node:crypto"
import { promises as dns } from "node:dns"

import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getPayFastValidationUrl } from "@/lib/payfast"
import { sendOrderConfirmation } from "@/lib/email/send"
import { sendNewOrderAdminEmail } from "@/lib/email/send/new-order-admin";

export const runtime = "nodejs"

type PayFastData = Record<string, string>

const PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
  "sandbox.payfast.co.za",
]

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    )
  }

  return value
}

function encodePayFastValue(value: string) {
  return encodeURIComponent(value.trim()).replace(
    /%20/g,
    "+"
  )
}

/**
 * Builds the parameter string in the same order in which
 * PayFast submitted the fields.
 *
 * The signature field itself must not be included.
 */
function createPayFastParameterString(
  entries: Array<[string, string]>
) {
  return entries
    .filter(([key]) => key !== "signature")
    .map(
      ([key, value]) =>
        `${key}=${encodePayFastValue(value)}`
    )
    .join("&")
}

function generateNotificationSignature(
  parameterString: string,
  passphrase?: string
) {
  const stringToHash = passphrase
    ? `${parameterString}&passphrase=${encodePayFastValue(
        passphrase
      )}`
    : parameterString

  return createHash("md5")
    .update(stringToHash)
    .digest("hex")
}

function getRequestIp(request: Request) {
  const forwardedFor =
    request.headers.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      ?.trim()
      .replace(/^::ffff:/, "")
  }

  const realIp = request.headers.get("x-real-ip")

  return realIp?.trim().replace(/^::ffff:/, "") || null
}

async function getValidPayFastIps() {
  const addresses = new Set<string>()

  await Promise.all(
    PAYFAST_HOSTS.map(async (host) => {
      try {
        const results = await dns.lookup(host, {
          all: true,
        })

        for (const result of results) {
          addresses.add(
            result.address.replace(/^::ffff:/, "")
          )
        }
      } catch (error) {
        console.error(
          `Could not resolve PayFast host ${host}:`,
          error
        )
      }
    })
  )

  return addresses
}

async function verifyPayFastIp(request: Request) {
  const requestIp = getRequestIp(request)

  /*
   * Some local tunnel providers do not expose PayFast's
   * original IP consistently. During local development,
   * the server validation request remains mandatory.
   */
  if (!requestIp) {
    return process.env.NODE_ENV !== "production"
  }

  const validIps = await getValidPayFastIps()

  return validIps.has(requestIp)
}

async function verifyWithPayFast(
  parameterString: string
) {
  const response = await fetch(
    getPayFastValidationUrl(),
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: parameterString,
      cache: "no-store",
    }
  )

  if (!response.ok) {
    console.error(
      "PayFast validation request failed:",
      response.status,
      response.statusText
    )

    return false
  }

  const result = (await response.text()).trim()

  return result === "VALID"
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const formData = new URLSearchParams(rawBody)

    const entries = Array.from(formData.entries())
    const payFastData: PayFastData =
      Object.fromEntries(entries)

    console.log("PayFast ITN received:", payFastData)

    const submittedSignature =
      payFastData.signature

    if (!submittedSignature) {
      console.error(
        "PayFast ITN rejected: missing signature."
      )

      return new NextResponse(
        "Missing signature",
        { status: 400 }
      )
    }

    const parameterString =
      createPayFastParameterString(entries)

    const passphrase =
      process.env.PAYFAST_PASSPHRASE?.trim()

    const generatedSignature =
      generateNotificationSignature(
        parameterString,
        passphrase
      )

    if (
      generatedSignature !== submittedSignature
    ) {
      console.error(
        "PayFast ITN rejected: invalid signature.",
        {
          submittedSignature,
          generatedSignature,
          parameterString,
        }
      )

      return new NextResponse(
        "Invalid signature",
        { status: 400 }
      )
    }

    const expectedMerchantId =
      getRequiredEnvironmentVariable(
        "PAYFAST_MERCHANT_ID"
      )

    if (
      payFastData.merchant_id !==
      expectedMerchantId
    ) {
      console.error(
        "PayFast ITN rejected: merchant ID mismatch."
      )

      return new NextResponse(
        "Invalid merchant",
        { status: 400 }
      )
    }

    const orderId = payFastData.m_payment_id

    if (!orderId) {
      console.error(
        "PayFast ITN rejected: missing order ID."
      )

      return new NextResponse(
        "Missing order ID",
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentStatus: true,
        orderStatus: true,
      },
    })

    if (!order) {
      console.error(
        `PayFast ITN rejected: order ${orderId} was not found.`
      )

      return new NextResponse(
        "Order not found",
        { status: 404 }
      )
    }

    const expectedAmount = Number(order.total)
    const receivedAmount = Number(
      payFastData.amount_gross
    )

    if (
      !Number.isFinite(receivedAmount) ||
      Math.abs(
        expectedAmount - receivedAmount
      ) > 0.01
    ) {
      console.error(
        "PayFast ITN rejected: amount mismatch.",
        {
          expectedAmount,
          receivedAmount,
        }
      )

      return new NextResponse(
        "Amount mismatch",
        { status: 400 }
      )
    }

    const validIp =
      await verifyPayFastIp(request)

    if (!validIp) {
      console.error(
        "PayFast ITN rejected: invalid source IP.",
        {
          requestIp: getRequestIp(request),
        }
      )

      return new NextResponse(
        "Invalid source",
        { status: 400 }
      )
    }

    const validServerConfirmation =
      await verifyWithPayFast(parameterString)

    if (!validServerConfirmation) {
      console.error(
        "PayFast ITN rejected: PayFast validation returned INVALID."
      )

      return new NextResponse(
        "Invalid payment",
        { status: 400 }
      )
    }

    if (
      payFastData.payment_status !== "COMPLETE"
    ) {
      console.log(
        `PayFast payment status for order ${order.orderNumber}:`,
        payFastData.payment_status
      )

      return new NextResponse("OK", {
        status: 200,
      })
    }

    /*
     * ITNs may be retried. This makes the operation
     * idempotent and prevents unnecessary updates.
     */
    if (order.paymentStatus === "PAID") {
  console.log(
    `Order ${order.orderNumber} is already marked as paid.`
  )

  try {
  await sendOrderConfirmation(order.id)
  await sendNewOrderAdminEmail(order.id)
} catch (emailError) {
  console.error(
    `Email retry failed for ${order.orderNumber}:`,
    emailError
  )
}

  return new NextResponse("OK", {
    status: 200,
  })
}

    await prisma.order.update({
  where: {
    id: order.id,
  },
  data: {
    paymentStatus: "PAID",
    orderStatus: "PAID",
  },
})

console.log(
  `Order ${order.orderNumber} marked as paid.`
)

try {
  await sendOrderConfirmation(order.id)
  await sendNewOrderAdminEmail(order.id)
} catch (emailError) {
  console.error(
    `Order email processing failed for ${order.orderNumber}:`,
    emailError
  )
}

return new NextResponse("OK", {
  status: 200,
})
  } catch (error) {
    console.error(
      "PayFast ITN processing failed:",
      error
    )

    return new NextResponse(
      "Internal server error",
      { status: 500 }
    )
  }
}