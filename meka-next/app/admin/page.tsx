import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Meka WC administration
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
                Admin dashboard
              </h1>

              <p className="mt-2 text-gray-600">
                Signed in as {session.user.email}
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
            >
              Return to store
            </Link>
            <SignOutButton />
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AdminCard
              title="Products"
              description="Create, update and manage store products."
              href="/admin/products"
            />

            <AdminCard
              title="Categories"
              description="Create, update and manage product categories."
              href="/admin/categories"
            />

            <AdminCard
  title="Orders"
  description="Review customer orders and fulfilment."
  href="/admin/orders"
/>

            <AdminCard
              title="Customers"
              description="View registered customer accounts."
            />
          </div>
        </div>
      </section>
    </main>
  )
}

type AdminCardProps = {
  title: string
  description: string
  href?: string
}

function AdminCard({
  title,
  description,
  href,
}: AdminCardProps) {
  const content = (
    <article className="h-full rounded-xl border border-gray-200 p-5 transition hover:border-gray-400 hover:bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-950">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </article>
  )

  if (!href) {
    return content
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  )
}