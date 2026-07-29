import Link from "next/link"
import type {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client"

import StatusBadge from "@/components/admin/dashboard/StatusBadge"
import { formatPrice } from "@/lib/formatPrice"

type RecentOrder = {
  id: string
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  total: Prisma.Decimal
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdAt: Date
}

type RecentOrdersTableProps = {
  orders: RecentOrder[]
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(date)
}

export default function RecentOrdersTable({
  orders,
}: RecentOrdersTableProps) {
  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">
            Recent orders
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            The five most recently placed orders.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-gray-700 transition hover:text-gray-950"
        >
          View all orders →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="font-semibold text-gray-900">
            No orders yet
          </p>

          <p className="mt-1 text-sm text-gray-600">
            New customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Order
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Customer
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-gray-950 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap font-medium text-gray-900">
                        {order.firstName} {order.lastName}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {order.email}
                      </p>
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
  )
}