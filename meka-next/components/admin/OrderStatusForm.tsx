"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import {
  OrderStatus,
  PaymentStatus,
} from "@prisma/client"

type OrderStatusFormProps = {
  orderId: string
  initialOrderStatus: OrderStatus
  initialPaymentStatus: PaymentStatus
}

export default function OrderStatusForm({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: OrderStatusFormProps) {
  const router = useRouter()

  const [orderStatus, setOrderStatus] =
    useState<OrderStatus>(initialOrderStatus)

  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>(initialPaymentStatus)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const hasChanges =
    orderStatus !== initialOrderStatus ||
    paymentStatus !== initialPaymentStatus

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!hasChanges) {
      return
    }

    setError("")
    setSuccessMessage("")
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus,
            paymentStatus,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update the order."
        )
      }

      setSuccessMessage("Order updated successfully.")
      router.refresh()
    } catch (error) {
      console.error("Order update failed:", error)

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update the order."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-950">
          Manage order
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Update payment and local delivery progress for this order.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="paymentStatus"
            className="block text-sm font-semibold text-gray-800"
          >
            Payment status
          </label>

          <select
            id="paymentStatus"
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(
                event.target.value as PaymentStatus
              )
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="orderStatus"
            className="block text-sm font-semibold text-gray-800"
          >
            Delivery progress
          </label>

          <select
            id="orderStatus"
            value={orderStatus}
            onChange={(event) =>
              setOrderStatus(
                event.target.value as OrderStatus
              )
            }
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="PENDING">Order received</option>
            <option value="PROCESSING">Preparing order</option>
            <option value="SHIPPED">Out for delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            “Out for delivery” uses the existing SHIPPED database
            status, so no database change is required.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !hasChanges}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
      >
        {isSubmitting ? "Saving changes..." : "Save changes"}
      </button>
    </form>
  )
}