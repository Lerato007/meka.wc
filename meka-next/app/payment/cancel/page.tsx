import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <section className="min-h-[70vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
        <h1 className="text-3xl font-bold text-gray-950">
          Payment cancelled
        </h1>

        <p className="mt-3 text-gray-600">
          Your order remains unpaid. You can return to your
          payment page and try again.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          Return to shop
        </Link>
      </div>
    </section>
  )
}