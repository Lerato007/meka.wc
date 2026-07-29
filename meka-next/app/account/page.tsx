import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import EmptyState from "@/components/ui/EmptyState"
import PageHeader from "@/components/ui/PageHeader"
import StatCard from "@/components/ui/StatCard"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatPrice } from "@/lib/formatPrice"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeZone: "Africa/Johannesburg",
  }).format(date)
}

type AccountActionProps = {
  title: string
  description: string
  href?: string
}

function AccountAction({
  title,
  description,
  href,
}: AccountActionProps) {
  const content = (
    <article className="h-full rounded-xl border border-gray-200 p-5 transition hover:border-gray-400 hover:bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>

      {href && (
        <p className="mt-4 text-sm font-semibold text-gray-700">
          Open →
        </p>
      )}
    </article>
  )

  if (!href) {
    return content
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  )
}

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account")
  }

  const customer = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!customer?.email) {
    redirect("/login?callbackUrl=/account")
  }

  const orderWhere = {
    OR: [
      {
        userId: customer.id,
      },
      {
        email: customer.email,
      },
    ],
  }

  const [
    totalOrders,
    activeOrders,
    deliveredOrders,
    amountSpentResult,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: orderWhere,
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        orderStatus: {
          in: ["PAID", "PROCESSING", "SHIPPED"],
        },
      },
    }),

    prisma.order.count({
      where: {
        ...orderWhere,
        orderStatus: "DELIVERED",
      },
    }),

    prisma.order.aggregate({
      where: {
        ...orderWhere,
        paymentStatus: "PAID",
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.findMany({
      where: orderWhere,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
      },
    }),
  ])

  const amountSpent = amountSpentResult._sum.total ?? 0

  const displayName =
    customer.name?.trim() ||
    customer.email.split("@")[0]

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <PageHeader
            eyebrow="My Meka.WC account"
            title={`Welcome back, ${displayName}`}
            description="View your orders and manage your account."
            actionLabel="Return to store"
            actionHref="/"
          />

          <div className="mt-10">
            <div>
              <h2 className="text-xl font-semibold text-gray-950">
                Account overview
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                A summary of your order activity.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total orders"
                value={totalOrders}
                description="All orders placed"
              />

              <StatCard
                title="In progress"
                value={activeOrders}
                description="Paid, processing or shipped"
              />

              <StatCard
                title="Delivered"
                value={deliveredOrders}
                description="Successfully delivered orders"
              />

              <StatCard
                title="Amount spent"
                value={formatPrice(amountSpent)}
                description="Total from paid orders"
              />
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-10">
            <div>
              <h2 className="text-xl font-semibold text-gray-950">
                Quick actions
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Access the main areas of your account.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <AccountAction
                title="My orders"
                description="View your complete order history."
                href="/account/orders"
              />

              <AccountAction
                title="My profile"
                description="Review and update your personal details."
                href="/account/profile"
              />

              <AccountAction
                title="Addresses"
                description="Manage your delivery addresses."
                href="/account/addresses"
              />

              <AccountAction
                title="Security"
                description="Manage your password and account access."
              />
            </div>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-950">
                  Recent orders
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Your five most recently placed orders.
                </p>
              </div>

              <Link
                href="/account/orders"
                className="text-sm font-semibold text-gray-700 transition hover:text-gray-950"
              >
                View all orders →
              </Link>
            </div>

            <div className="mt-6">
              {recentOrders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  description="Your orders will appear here after you make a purchase."
                  actionLabel="Browse products"
                  actionHref="/products"
                />
              ) : (
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
                            Payment
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Order status
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200 bg-white">
                        {recentOrders.map((order) => (
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}