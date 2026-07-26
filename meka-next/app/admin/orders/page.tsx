import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { formatPrice } from "@/lib/formatPrice"

const session = await auth()

if (!session?.user) {
  redirect("/login?callbackUrl=/admin/orders")
}

if (session.user.role !== "ADMIN") {
  redirect("/")
}

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

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
            Orders
          </h1>

          <p className="mt-2 text-gray-600">
            Review customer orders, payments and fulfilment
            progress.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-950">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Customer orders will appear here once checkout has
              been completed.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              View storefront
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Items
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-semibold text-gray-950">
                          {order.orderNumber}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="whitespace-nowrap font-medium text-gray-950">
                          {order.firstName} {order.lastName}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.email}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {order._count.items}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-950">
                        {formatPrice(order.total)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                            order.paymentStatus
                          )}`}
                        >
                          {formatStatus(order.paymentStatus)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                            order.orderStatus
                          )}`}
                        >
                          {formatStatus(order.orderStatus)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-semibold text-gray-700 hover:text-gray-950 hover:underline"
                        >
                          View order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}