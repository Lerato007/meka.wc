import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import DashboardStats from "@/components/admin/dashboard/DashboardStats"
import QuickActions from "@/components/admin/dashboard/QuickActions"
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable"
import SignOutButton from "@/components/auth/SignOutButton"
import { formatPrice } from "@/lib/formatPrice"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function getSouthAfricaDayRange() {
  const now = new Date()

  const southAfricaOffsetMilliseconds =
    2 * 60 * 60 * 1000

  const southAfricaNow = new Date(
    now.getTime() + southAfricaOffsetMilliseconds
  )

  const startOfDay = new Date(
    Date.UTC(
      southAfricaNow.getUTCFullYear(),
      southAfricaNow.getUTCMonth(),
      southAfricaNow.getUTCDate(),
      0,
      0,
      0,
      0
    ) - southAfricaOffsetMilliseconds
  )

  const endOfDay = new Date(
    Date.UTC(
      southAfricaNow.getUTCFullYear(),
      southAfricaNow.getUTCMonth(),
      southAfricaNow.getUTCDate() + 1,
      0,
      0,
      0,
      0
    ) - southAfricaOffsetMilliseconds
  )

  return {
    startOfDay,
    endOfDay,
  }
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const { startOfDay, endOfDay } =
    getSouthAfricaDayRange()

  const [
    ordersToday,
    pendingOrders,
    revenueTodayResult,
    products,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    }),

    prisma.order.count({
      where: {
        paymentStatus: "PENDING",
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      _sum: {
        total: true,
      },
    }),

    prisma.product.findMany({
      select: {
        stock: true,
        lowStockThreshold: true,
      },
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        total: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
      },
    }),
  ])

  const revenueToday =
    revenueTodayResult._sum.total ?? 0

  const lowStockProducts = products.filter(
    (product) =>
      product.stock <= product.lowStockThreshold
  ).length

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Meka WC administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                Admin dashboard
              </h1>

              <p className="mt-2 text-gray-600">
                Signed in as {session.user.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                Return to store
              </Link>

              <SignOutButton />
            </div>
          </div>

          <DashboardStats
            ordersToday={ordersToday}
            pendingOrders={pendingOrders}
            revenueToday={formatPrice(revenueToday)}
            lowStockProducts={lowStockProducts}
          />

          <RecentOrdersTable orders={recentOrders} />

          <QuickActions />
        </div>
      </section>
    </main>
  )
}