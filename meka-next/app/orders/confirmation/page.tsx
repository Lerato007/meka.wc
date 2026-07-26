import Link from "next/link"

type OrderConfirmationPageProps = {
  searchParams: Promise<{
    orderNumber?: string
    total?: string
  }>
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value)
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const params = await searchParams

  const orderNumber = params.orderNumber
  const total = Number(params.total ?? 0)

  return (
    <section className="min-h-[70vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-950">
          Order created successfully
        </h1>

        <p className="mt-3 text-gray-600">
          Thank you for your order. Your order has been
          recorded and is awaiting payment.
        </p>

        {orderNumber && (
          <div className="mt-8 rounded-xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">
              Order number
            </p>

            <p className="mt-1 text-lg font-bold text-gray-950">
              {orderNumber}
            </p>

            {Number.isFinite(total) && total > 0 && (
              <>
                <p className="mt-4 text-sm text-gray-500">
                  Order total
                </p>

                <p className="mt-1 text-lg font-bold text-gray-950">
                  {formatPrice(total)}
                </p>
              </>
            )}
          </div>
        )}

        <p className="mt-6 text-sm leading-6 text-gray-500">
          Payment functionality will be added in the next
          stage. Do not dispatch the order until payment has
          been confirmed.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Continue shopping
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  )
}