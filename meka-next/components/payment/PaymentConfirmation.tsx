"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

type OrderDetails = {
  id: string
  orderNumber: string
  firstName: string
  lastName: string
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
  subtotal: number
  shipping: number
  total: number
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

type OrderResponse = {
  success: boolean
  message?: string
  order?: OrderDetails
}

type PaymentConfirmationProps = {
  orderId: string
  fallbackOrderNumber?: string
}

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 30

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value)
}

function getOrderStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Order received"
    case "PAID":
    case "PROCESSING":
      return "Preparing your order"
    case "SHIPPED":
      return "Out for delivery"
    case "DELIVERED":
      return "Delivered"
    case "CANCELLED":
      return "Cancelled"
    default:
      return status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (character) =>
          character.toUpperCase()
        )
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800"
    case "CANCELLED":
      return "bg-red-100 text-red-800"
    case "SHIPPED":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-amber-100 text-amber-800"
  }
}

export default function PaymentConfirmation({
  orderId,
  fallbackOrderNumber,
}: PaymentConfirmationProps) {
  const [order, setOrder] =
    useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [pollAttempts, setPollAttempts] = useState(0)

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError(
        "The payment return link does not contain a valid order ID."
      )
      setIsLoading(false)
      return
    }

    try {
        console.log("====================================")
  console.log("Loading order:", orderId)
  console.log(
    "Fetching:",
    `/api/orders/${encodeURIComponent(orderId)}`
  )
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      )
      console.log(
  "Response received:",
  response.status,
  response.statusText
)

      const result =
        (await response.json()) as OrderResponse

        console.log("API Response:", result)

      if (!response.ok || !result.success || !result.order) {
        throw new Error(
          result.message ||
            "We could not retrieve your order."
        )
      }

      setOrder(result.order)
      setError("")
    } catch (error) {
  console.error("Payment confirmation failed:", error)
      setError(
        error instanceof Error
          ? error.message
          : "We could not retrieve your order."
      )
    } finally {
  console.log("Finished loading order")
  setIsLoading(false)
}
  }, [orderId])

  useEffect(() => {
    void loadOrder()
  }, [loadOrder])

  useEffect(() => {
    if (
      !order ||
      order.paymentStatus === "PAID" ||
      order.orderStatus === "CANCELLED" ||
      pollAttempts >= MAX_POLL_ATTEMPTS
    ) {
      return
    }

    const timer = window.setTimeout(() => {
      setPollAttempts((current) => current + 1)
      void loadOrder()
    }, POLL_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [loadOrder, order, pollAttempts])

  if (isLoading) {
    return (
      <section className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-950" />

          <h1 className="mt-6 text-2xl font-bold text-gray-950">
            Checking your payment
          </h1>

          <p className="mt-3 text-gray-600">
            Please wait while we retrieve your order.
          </p>
        </div>
      </section>
    )
  }

  if (error || !order) {
    return (
      <section className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-950">
            We could not confirm your order
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          {fallbackOrderNumber && (
            <p className="mt-3 text-sm text-gray-500">
              Order reference: {fallbackOrderNumber}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true)
                setError("")
                void loadOrder()
              }}
              className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Try again
            </button>

            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              View my orders
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const isPaid = order.paymentStatus === "PAID"
  const isCancelled = order.orderStatus === "CANCELLED"
  const isStillChecking =
    !isPaid &&
    !isCancelled &&
    pollAttempts < MAX_POLL_ATTEMPTS

  return (
    <section className="min-h-[70vh] bg-gray-50 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-10 text-center sm:px-10">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold ${
              isPaid
                ? "bg-green-100 text-green-700"
                : isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {isPaid ? "✓" : isCancelled ? "×" : "…"}
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-950">
            {isPaid
              ? "Payment received"
              : isCancelled
                ? "Order cancelled"
                : "Payment submitted"}
          </h1>

          <p className="mt-3 text-gray-600">
            {isPaid
              ? `Thank you for shopping with Meka.WC, ${order.firstName}.`
              : isCancelled
                ? "This order has been cancelled."
                : "PayFast returned you to Meka.WC. We are waiting for final payment confirmation."}
          </p>

          {isStillChecking && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Checking payment automatically
            </div>
          )}

          {!isPaid &&
            !isCancelled &&
            pollAttempts >= MAX_POLL_ATTEMPTS && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Payment confirmation is taking longer than
                expected. Your order remains saved, and you can
                check its status from your account.
              </div>
            )}
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 sm:px-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Order number
              </p>
              <p className="mt-1 font-semibold text-gray-950">
                {order.orderNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Order total
              </p>
              <p className="mt-1 font-semibold text-gray-950">
                {formatPrice(order.total)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment status
              </p>
              <p className="mt-1 font-semibold text-gray-950">
                {isPaid ? "Paid" : order.paymentStatus}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Delivery progress
              </p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                  order.orderStatus
                )}`}
              >
                {getOrderStatusLabel(order.orderStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <h2 className="text-lg font-bold text-gray-950">
            Delivery address
          </h2>

          <address className="mt-3 not-italic leading-7 text-gray-600">
            <span className="block">
              {order.firstName} {order.lastName}
            </span>
            <span className="block">
              {order.addressLine1}
            </span>
            {order.addressLine2 && (
              <span className="block">
                {order.addressLine2}
              </span>
            )}
            <span className="block">
              {order.city}, {order.province}
            </span>
            <span className="block">
              {order.postalCode}
            </span>
          </address>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="font-semibold text-gray-950">
              Local Paarl delivery
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Your order will be prepared for local delivery.
              Delivery updates will appear in your account.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/account/orders/${order.id}`}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              View my order
            </Link>

            <Link
              href="/products"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}