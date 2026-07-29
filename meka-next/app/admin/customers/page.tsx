import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(date)
}

export default async function AdminCustomersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/customers")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const customers = await prisma.user.findMany({
  where: {
    role: "CUSTOMER",
  },
  orderBy: {
    createdAt: "desc",
  },
  select: {
    id: true,
    name: true,
    email: true,
    createdAt: true,
  },
})

const customerEmails = customers
  .map((customer) => customer.email)
  .filter((email): email is string => Boolean(email))

const orderCounts = await prisma.order.groupBy({
  by: ["email"],
  where: {
    email: {
      in: customerEmails,
    },
  },
  _count: {
    _all: true,
  },
})

const orderCountByEmail = new Map(
  orderCounts.map((item) => [
    item.email.toLowerCase(),
    item._count._all,
  ])
)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Meka WC administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                Customers
              </h1>

              <p className="mt-2 text-gray-600">
                View registered customer accounts and order activity.
              </p>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              Back to dashboard
            </Link>
          </div>

          {customers.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <p className="font-semibold text-gray-900">
                No customers found
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Registered customer accounts will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Customer
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Email
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Joined
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Orders
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-950">
                            {customer.name || "Unnamed customer"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {customer.email}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {formatDate(customer.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-950">
                          {customer.email
  ? orderCountByEmail.get(customer.email.toLowerCase()) ?? 0
  : 0}
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
    </main>
  )
}