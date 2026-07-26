import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import PayFastPaymentButton from "@/components/payment/PayFastPaymentButton"

type PaymentPageProps = {
  params: Promise<{
    orderId: string
  }>
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(value))
}

export default async function PaymentPage({
  params,
}: PaymentPageProps) {
  const { orderId } = await params

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
    notFound()
  }

  const cannotPay =
    order.paymentStatus === "PAID" ||
    order.orderStatus === "CANCELLED"

  return (
    <section className="min-h-[70vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Secure payment
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
          Complete your payment
        </h1>

        <p className="mt-3 text-gray-600">
          You will be redirected to the PayFast sandbox to
          complete the test transaction.
        </p>

        <div className="mt-8 rounded-xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Order number
          </p>

          <p className="mt-1 font-bold text-gray-950">
            {order.orderNumber}
          </p>

          <p className="mt-5 text-sm text-gray-500">
            Amount due
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-950">
            {formatPrice(order.total)}
          </p>
        </div>

        {cannotPay ? (
          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            {order.paymentStatus === "PAID"
              ? "This order has already been paid."
              : "This order has been cancelled and cannot be paid."}
          </div>
        ) : (
          <PayFastPaymentButton orderId={order.id} />
        )}
      </div>
    </section>
  )
}