import type { LabelHTMLAttributes } from "react"

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean
}

export default function Label({
  children,
  required = false,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      className={`mb-2 block text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}

      {required && (
        <span className="ml-1 text-red-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}