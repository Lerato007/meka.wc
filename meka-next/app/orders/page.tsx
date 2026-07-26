import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { formatPrice } from "@/lib/formatPrice"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
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

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent("/orders")}`
    )
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  })

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            My Orders
          </h1>

          <p className="mt-2 text-gray-600">
            View your previous purchases and track their payment and
            delivery progress.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-950">
              You have no orders yet
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Orders placed while signed in will appear here.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order number
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-gray-950">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Placed {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Items
                      </p>

                      <p className="mt-2 font-medium text-gray-950">
                        {order._count.items}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total
                      </p>

                      <p className="mt-2 font-semibold text-gray-950">
                        {formatPrice(order.total)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Payment
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                          order.paymentStatus
                        )}`}
                      >
                        {formatStatus(order.paymentStatus)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Order status
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                          order.orderStatus
                        )}`}
                      >
                        {formatStatus(order.orderStatus)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
                  >
                    View order
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}