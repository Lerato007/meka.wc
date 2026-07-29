import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import OrderTimeline from "@/components/ui/OrderTimeline"
import StatusBadge from "@/components/ui/StatusBadge"
import SummaryCard from "@/components/ui/SummaryCard"
import { formatPrice } from "@/lib/formatPrice"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type OrderDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  }).format(date)
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
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

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [
        {
          userId: customer.id,
        },
        {
          email: customer.email,
        },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      province: true,
      postalCode: true,
      subtotal: true,
      shipping: true,
      total: true,
      paymentStatus: true,
      orderStatus: true,
      createdAt: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          productId: true,
          name: true,
          price: true,
          quantity: true,
          imageUrl: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition hover:text-gray-950"
        >
          <span aria-hidden="true">←</span>
          Back to orders
        </Link>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Order details
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                Order {order.orderNumber}
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Placed on {formatOrderDate(order.createdAt)}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[390px]">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment status
                </p>

                <div className="mt-3">
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Order status
                </p>

                <div className="mt-3">
                  <StatusBadge status={order.orderStatus} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <SummaryCard title="Items purchased">
                <div className="divide-y divide-gray-200">
                  {order.items.map((item) => {
                    const lineTotal =
                      Number(item.price) * item.quantity

                    return (
                      <article
                        key={item.id}
                        className="flex flex-col gap-5 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                      >
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="font-semibold text-gray-950 transition hover:underline"
                          >
                            {item.name}
                          </Link>

                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>
                              Unit price: {formatPrice(item.price)}
                            </p>

                            <p>Quantity: {item.quantity}</p>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Line total
                          </p>

                          <p className="mt-1 font-semibold text-gray-950">
                            {formatPrice(lineTotal)}
                          </p>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </SummaryCard>

              <SummaryCard title="Delivery information">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-950">
                      Customer
                    </h3>

                    <div className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                      <p>
                        {order.firstName} {order.lastName}
                      </p>

                      <p>{order.email}</p>

                      <p>{order.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-950">
                      Delivery address
                    </h3>

                    <address className="mt-3 space-y-1 text-sm not-italic leading-6 text-gray-600">
                      <p>{order.addressLine1}</p>

                      {order.addressLine2 && (
                        <p>{order.addressLine2}</p>
                      )}

                      <p>{order.city}</p>

                      <p>{order.province}</p>

                      <p>{order.postalCode}</p>
                    </address>
                  </div>
                </div>
              </SummaryCard>
            </div>

            <aside className="space-y-6">
              <SummaryCard title="Order progress">
                <OrderTimeline
                  orderStatus={order.orderStatus}
                  paymentStatus={order.paymentStatus}
                />
              </SummaryCard>

              <SummaryCard title="Order summary">
                <dl className="space-y-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="text-gray-600">Subtotal</dt>

                    <dd className="font-medium text-gray-950">
                      {formatPrice(order.subtotal)}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="text-gray-600">Shipping</dt>

                    <dd className="font-medium text-gray-950">
                      {Number(order.shipping) === 0
                        ? "Free"
                        : formatPrice(order.shipping)}
                    </dd>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-base font-semibold text-gray-950">
                        Total
                      </dt>

                      <dd className="text-xl font-bold text-gray-950">
                        {formatPrice(order.total)}
                      </dd>
                    </div>
                  </div>
                </dl>
              </SummaryCard>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="font-semibold text-gray-950">
                  Need assistance?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Contact Meka.WC and include your order number so
                  that we can assist you quickly.
                </p>

                <p className="mt-3 text-sm font-semibold text-gray-950">
                  {order.orderNumber}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}