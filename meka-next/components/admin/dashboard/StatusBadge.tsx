type StatusBadgeProps = {
  status: string
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const styles: Record<string, string> = {
    PENDING:
      "border-yellow-200 bg-yellow-50 text-yellow-800",
    PAID:
      "border-green-200 bg-green-50 text-green-800",
    PROCESSING:
      "border-blue-200 bg-blue-50 text-blue-800",
    SHIPPED:
      "border-indigo-200 bg-indigo-50 text-indigo-800",
    DELIVERED:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    CANCELLED:
      "border-red-200 bg-red-50 text-red-800",
    FAILED:
      "border-red-200 bg-red-50 text-red-800",
    REFUNDED:
      "border-purple-200 bg-purple-50 text-purple-800",
    EXPIRED:
      "border-gray-200 bg-gray-100 text-gray-700",
  }

  const label = status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    )

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] ??
        "border-gray-200 bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  )
}