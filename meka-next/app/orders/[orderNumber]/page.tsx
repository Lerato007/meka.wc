import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/formatPrice"

type PageProps = {
  params: Promise<{
    orderNumber: string
  }>
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date)
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getStatusStyles(status: string) {
  switch (status) {
    case "PAID":
    case "DELIVERED":
      return "bg-green-100 text-green-700"

    case "PROCESSING":
    case "SHIPPED":
      return "bg-blue-100 text-blue-700"

    case "FAILED":
    case "CANCELLED":
      return "bg-red-100 text-red-700"

    case "REFUNDED":
      return "bg-purple-100 text-purple-700"

    default:
      return "bg-yellow-100 text-yellow-700"
  }
}

export default async function CustomerOrderPage({
  params,
}: PageProps) {
  const { orderNumber } = await params

  const session = await auth()

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/orders/${orderNumber}`
      )}`
    )
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: session.user.id,
    },

    include: {
      items: true,
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <Link
            href="/orders"
            className="text-sm font-semibold text-gray-600 hover:text-gray-950 hover:underline"
          >
            ← Back to My Orders
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-gray-600">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold">
              Payment Status
            </h2>

            <span
              className={`mt-5 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyles(
                order.paymentStatus
              )}`}
            >
              {formatStatus(order.paymentStatus)}
            </span>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold">
              Order Status
            </h2>

            <span
              className={`mt-5 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyles(
                order.orderStatus
              )}`}
            >
              {formatStatus(order.orderStatus)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-semibold">
            Shipping Address
          </h2>

          <div className="mt-5 leading-7">
            <p>
              {order.firstName} {order.lastName}
            </p>

            <p>{order.addressLine1}</p>

            {order.addressLine2 && (
              <p>{order.addressLine2}</p>
            )}

            <p>{order.city}</p>

            <p>{order.province}</p>

            <p>{order.postalCode}</p>

            <p className="pt-3 text-gray-600">
              {order.email}
            </p>

            <p>{order.phone}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-semibold">
            Order Items
          </h2>

          <div className="mt-6 divide-y">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <h3 className="font-medium">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div className="font-semibold">
                  {formatPrice(item.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>

            <div className="flex justify-between border-t pt-4 text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}