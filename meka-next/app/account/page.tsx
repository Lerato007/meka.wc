import Link from "next/link"
import { redirect } from "next/navigation"
import { MapPin, Package, UserRound } from "lucide-react"

import { auth } from "@/auth"

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account")
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          My account
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Manage your profile, orders, and saved delivery addresses.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <Link
          href="/account/orders"
          className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
            <Package className="h-5 w-5 text-neutral-700" />
          </div>

          <h2 className="mt-5 font-semibold text-neutral-950">My orders</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            View your order history and track recent purchases.
          </p>
        </Link>

        <Link
          href="/account/profile"
          className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
            <UserRound className="h-5 w-5 text-neutral-700" />
          </div>

          <h2 className="mt-5 font-semibold text-neutral-950">My profile</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Update your personal and account information.
          </p>
        </Link>

        <Link
          href="/account/addresses"
          className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
            <MapPin className="h-5 w-5 text-neutral-700" />
          </div>

          <h2 className="mt-5 font-semibold text-neutral-950">
            Saved addresses
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Add, edit, and manage your delivery addresses.
          </p>
        </Link>
      </section>
    </main>
  )
}