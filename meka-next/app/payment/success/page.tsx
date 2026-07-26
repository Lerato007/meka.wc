import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <section className="min-h-[70vh] bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-950">
          Payment submitted
        </h1>

        <p className="mt-3 text-gray-600">
          PayFast redirected you back successfully. Payment
          confirmation will be finalised through the PayFast
          notification.
        </p>

        <Link
          href="/products"
          className="mt-8 inline-flex rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          Continue shopping
        </Link>
      </div>
    </section>
  )
}