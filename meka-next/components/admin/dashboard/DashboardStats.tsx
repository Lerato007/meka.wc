import StatCard from "@/components/admin/dashboard/StatCard"

type DashboardStatsProps = {
  ordersToday: number
  pendingOrders: number
  revenueToday: string
  lowStockProducts: number
}

export default function DashboardStats({
  ordersToday,
  pendingOrders,
  revenueToday,
  lowStockProducts,
}: DashboardStatsProps) {
  return (
    <div className="mt-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-950">
          Store overview
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          A summary of your store activity and inventory.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Orders today"
          value={ordersToday.toString()}
          description="Orders placed today"
          href="/admin/orders"
        />

        <StatCard
          title="Pending payments"
          value={pendingOrders.toString()}
          description="Orders awaiting payment"
          href="/admin/orders"
        />

        <StatCard
          title="Revenue today"
          value={revenueToday}
          description="Revenue from paid orders"
          href="/admin/orders"
        />

        <StatCard
          title="Low stock products"
          value={lowStockProducts.toString()}
          description="Products at or below threshold"
          href="/admin/products"
        />
      </div>
    </div>
  )
}