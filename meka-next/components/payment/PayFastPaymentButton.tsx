"use client"

import { useState } from "react"

type PayFastPaymentButtonProps = {
  orderId: string
}

type PayFastResponse = {
  success: boolean
  message?: string
  processUrl?: string
  paymentData?: Record<string, string>
}

export default function PayFastPaymentButton({
  orderId,
}: PayFastPaymentButtonProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [error, setError] = useState("")

  async function handlePayment() {
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch(
        "/api/payfast/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      )

      const result =
        (await response.json()) as PayFastResponse

      if (
        !response.ok ||
        !result.success ||
        !result.processUrl ||
        !result.paymentData
      ) {
        throw new Error(
          result.message ||
            "We could not prepare your payment."
        )
      }

      const form = document.createElement("form")

      form.method = "POST"
      form.action = result.processUrl

      Object.entries(result.paymentData).forEach(
        ([name, value]) => {
          const input = document.createElement("input")

          input.type = "hidden"
          input.name = name
          input.value = value

          form.appendChild(input)
        }
      )

      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      console.error("PayFast redirect failed:", error)

      setError(
        error instanceof Error
          ? error.message
          : "We could not start the payment."
      )

      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting
          ? "Redirecting to PayFast..."
          : "Pay securely with PayFast"}
      </button>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Sandbox mode is enabled. No real money will be charged.
      </p>
    </div>
  )
}