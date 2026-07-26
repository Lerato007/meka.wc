import { createHash } from "node:crypto"

export type PayFastPaymentData = {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  cell_number?: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description?: string
}

export type SignedPayFastPaymentData =
  PayFastPaymentData & {
    signature: string
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

export function generatePayFastSignature(
  data: Record<string, string | undefined>,
  passphrase?: string
) {
  let parameterString = ""

  for (const key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      key !== "signature"
    ) {
      const value = data[key]

      if (value !== undefined && value !== "") {
        parameterString += `${key}=${encodeURIComponent(
          value.trim()
        ).replace(/%20/g, "+")}&`
      }
    }
  }

  parameterString = parameterString.slice(0, -1)

  if (passphrase) {
    parameterString += `&passphrase=${encodeURIComponent(
      passphrase.trim()
    ).replace(/%20/g, "+")}`
  }

  console.log("====================================")
console.log("PayFast parameter string:")
console.log(parameterString)
console.log("Generated signature:")
console.log(
  createHash("md5").update(parameterString).digest("hex")
)
console.log("====================================")

  return createHash("md5")
    .update(parameterString)
    .digest("hex")
}

export function getPayFastProcessUrl() {
  return process.env.PAYFAST_MODE === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process"
}

export function getPayFastValidationUrl() {
  return process.env.PAYFAST_MODE === "live"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate"
}

export function createPayFastPaymentData(input: {
  orderId: string
  orderNumber: string
  total: number
  firstName: string
  lastName: string
  email: string
  phone?: string
}) {
  const merchantId =
    getRequiredEnvironmentVariable("PAYFAST_MERCHANT_ID")

  const merchantKey =
    getRequiredEnvironmentVariable("PAYFAST_MERCHANT_KEY")

  const passphrase =
    getRequiredEnvironmentVariable("PAYFAST_PASSPHRASE")

  const appUrl =
    getRequiredEnvironmentVariable("APP_URL").replace(
      /\/$/,
      ""
    )

  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${appUrl}/payment/success?order=${input.orderNumber}`,
    cancel_url: `${appUrl}/payment/cancel?order=${input.orderNumber}`,
    notify_url: `${appUrl}/api/payfast/notify`,
    name_first: input.firstName,
    name_last: input.lastName,
    email_address: input.email,
    cell_number: input.phone || undefined,
    m_payment_id: input.orderId,
    amount: input.total.toFixed(2),
    item_name: `Meka.WC order ${input.orderNumber}`,
    item_description: `Payment for order ${input.orderNumber}`,
  }

  return {
    ...paymentData,
    signature: generatePayFastSignature(
      paymentData,
      passphrase
    ),
  }
}