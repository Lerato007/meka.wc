import Link from "next/link"

type StatCardProps = {
  title: string
  value: string
  description: string
  href: string
}

export default function StatCard({
  title,
  value,
  description,
  href,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 bg-gray-50 p-5 transition hover:border-gray-400 hover:bg-white hover:shadow-sm"
    >
      <p className="text-sm font-semibold text-gray-600">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold text-gray-700 transition group-hover:text-gray-950">
        View details →
      </p>
    </Link>
  )
}