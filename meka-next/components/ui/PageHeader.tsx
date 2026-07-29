import Link from "next/link"

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-gray-600">
            {description}
          </p>
        )}
      </div>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}