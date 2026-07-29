import type { ReactNode } from "react"

type StatCardProps = {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
}

export default function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-600">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
            {icon}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      )}
    </article>
  )
}