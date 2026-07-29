import type { ReactNode } from "react"

type SummaryCardProps = {
  title: string
  children: ReactNode
  className?: string
}

export default function SummaryCard({
  title,
  children,
  className = "",
}: SummaryCardProps) {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-950">
          {title}
        </h2>
      </div>

      <div className="p-6">{children}</div>
    </section>
  )
}