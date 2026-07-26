import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

function formatPrice(value: number | string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(value))
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date)
}

function prettyStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default async function OrderDetailsPage({
  params,
}: PageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: {
      id,
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
          <h1 className="text-3xl font-bold">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-gray-600">
            Created {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold">
              Customer
            </h2>

            <dl className="mt-5 space-y-3">

              <div>
                <dt className="text-sm text-gray-500">
                  Name
                </dt>

                <dd>
                  {order.firstName} {order.lastName}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Email
                </dt>

                <dd>{order.email}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">
                  Phone
                </dt>

                <dd>{order.phone}</dd>
              </div>

            </dl>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold">
              Shipping
            </h2>

            <div className="mt-5 leading-7">

              <p>{order.addressLine1}</p>

              {order.addressLine2 && (
                <p>{order.addressLine2}</p>
              )}

              <p>
                {order.city}
              </p>

              <p>
                {order.province}
              </p>

              <p>
                {order.postalCode}
              </p>

            </div>
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

            <div className="flex justify-between text-lg font-bold border-t pt-4">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

            <h2 className="font-semibold">
              Payment Status
            </h2>

            <p className="mt-3 text-lg">
              {prettyStatus(order.paymentStatus)}
            </p>

          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

            <h2 className="font-semibold">
              Order Status
            </h2>

            <p className="mt-3 text-lg">
              {prettyStatus(order.orderStatus)}
            </p>

          </div>

        </div>

      </div>
    </section>
  )
}