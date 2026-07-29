import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import EmptyState from "@/components/ui/EmptyState"
import PageHeader from "@/components/ui/PageHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatPrice } from "@/lib/formatPrice"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const ORDERS_PER_PAGE = 10

type OrdersPageProps = {
  searchParams: Promise<{
    search?: string
    status?: string
    page?: string
  }>
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(date)
}

function getPageNumber(value?: string) {
  const parsedPage = Number(value)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return parsedPage
}

function buildPageUrl({
  page,
  search,
  status,
}: {
  page: number
  search: string
  status: string
}) {
  const params = new URLSearchParams()

  if (search) {
    params.set("search", search)
  }

  if (status && status !== "ALL") {
    params.set("status", status)
  }

  params.set("page", page.toString())

  return `/account/orders?${params.toString()}`
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account/orders")
  }

  const customer = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
    },
  })

  if (!customer?.email) {
    redirect("/login?callbackUrl=/account/orders")
  }

  const resolvedSearchParams = await searchParams

  const search = resolvedSearchParams.search?.trim() ?? ""
  const status = resolvedSearchParams.status?.trim() ?? "ALL"
  const requestedPage = getPageNumber(resolvedSearchParams.page)

  const customerOrderFilter = {
    OR: [
      {
        userId: customer.id,
      },
      {
        email: customer.email,
      },
    ],
  }

  const validStatuses = [
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "EXPIRED",
  ] as const

  const selectedStatus = validStatuses.includes(
    status as (typeof validStatuses)[number],
  )
    ? (status as (typeof validStatuses)[number])
    : null

  const where = {
    AND: [
      customerOrderFilter,
      ...(search
        ? [
            {
              orderNumber: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(selectedStatus
        ? [
            {
              orderStatus: selectedStatus,
            },
          ]
        : []),
    ],
  }

  const totalOrders = await prisma.order.count({
    where,
  })

  const totalPages = Math.max(
    1,
    Math.ceil(totalOrders / ORDERS_PER_PAGE),
  )

  const currentPage = Math.min(requestedPage, totalPages)

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * ORDERS_PER_PAGE,
    take: ORDERS_PER_PAGE,
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      paymentStatus: true,
      orderStatus: true,
      total: true,
      items: {
        select: {
          quantity: true,
        },
      },
    },
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <PageHeader
            eyebrow="My Meka.WC account"
            title="My orders"
            description="View and track all the orders you have placed."
            actionLabel="Back to account"
            actionHref="/account"
          />

          <form
            action="/account/orders"
            method="get"
            className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Search orders
                </label>

                <input
                  id="search"
                  name="search"
                  type="search"
                  defaultValue={search}
                  placeholder="Search by order number"
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Order status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={selectedStatus ?? "ALL"}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-950 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex h-[42px] items-center justify-center rounded-lg bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Apply filters
              </button>
            </div>

            {(search || selectedStatus) && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Link
                  href="/account/orders"
                  className="text-sm font-semibold text-gray-700 hover:text-gray-950"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </form>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-950">
                Order history
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {totalOrders === 1
                  ? "1 order found"
                  : `${totalOrders} orders found`}
              </p>
            </div>

            {totalOrders > 0 && (
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          <div className="mt-6">
            {orders.length === 0 ? (
              <EmptyState
                title={
                  search || selectedStatus
                    ? "No matching orders"
                    : "No orders yet"
                }
                description={
                  search || selectedStatus
                    ? "No orders match the filters you selected. Try changing or clearing your filters."
                    : "Your order history will appear here after you make your first purchase."
                }
                actionLabel={
                  search || selectedStatus
                    ? "Clear filters"
                    : "Browse products"
                }
                actionHref={
                  search || selectedStatus
                    ? "/account/orders"
                    : "/products"
                }
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Order
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Date
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Items
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Payment
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Status
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Total
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200 bg-white">
                        {orders.map((order) => {
                          const itemCount = order.items.reduce(
                            (total, item) => total + item.quantity,
                            0,
                          )

                          return (
                            <tr
                              key={order.id}
                              className="transition hover:bg-gray-50"
                            >
                              <td className="whitespace-nowrap px-5 py-4">
                                <Link
                                  href={`/account/orders/${order.id}`}
                                  className="font-semibold text-gray-950 hover:underline"
                                >
                                  {order.orderNumber}
                                </Link>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                {formatOrderDate(order.createdAt)}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                                {itemCount}{" "}
                                {itemCount === 1 ? "item" : "items"}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <StatusBadge
                                  status={order.paymentStatus}
                                />
                              </td>

                              <td className="whitespace-nowrap px-5 py-4">
                                <StatusBadge
                                  status={order.orderStatus}
                                />
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-950">
                                {formatPrice(order.total)}
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-right">
                                <Link
                                  href={`/account/orders/${order.id}`}
                                  className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                                >
                                  View order
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label="Order history pagination"
                    className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-sm text-gray-600">
                      Showing{" "}
                      {(currentPage - 1) * ORDERS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        currentPage * ORDERS_PER_PAGE,
                        totalOrders,
                      )}{" "}
                      of {totalOrders}
                    </p>

                    <div className="flex items-center gap-2">
                      {currentPage > 1 ? (
                        <Link
                          href={buildPageUrl({
                            page: currentPage - 1,
                            search,
                            status: selectedStatus ?? "ALL",
                          })}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                        >
                          Previous
                        </Link>
                      ) : (
                        <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400">
                          Previous
                        </span>
                      )}

                      {currentPage < totalPages ? (
                        <Link
                          href={buildPageUrl({
                            page: currentPage + 1,
                            search,
                            status: selectedStatus ?? "ALL",
                          })}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                        >
                          Next
                        </Link>
                      ) : (
                        <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400">
                          Next
                        </span>
                      )}
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}