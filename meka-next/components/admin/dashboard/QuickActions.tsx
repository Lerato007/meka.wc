import Link from "next/link"

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
      <h3 className="text-lg font-semibold text-gray-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>

      {href && (
        <p className="mt-4 text-sm font-semibold text-gray-700">
          Manage →
        </p>
      )}
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

export default function QuickActions() {
  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-950">
          Quick actions
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Manage the main areas of your online store.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
  )
}