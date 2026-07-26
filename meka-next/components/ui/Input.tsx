import type { InputHTMLAttributes } from "react"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}

export default function Input({
  id,
  error,
  className = "",
  ...props
}: InputProps) {
  const errorId = id ? `${id}-error` : undefined

  return (
    <div>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        className={`
          w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900
          outline-none transition
          placeholder:text-gray-400
          focus:ring-2
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:border-gray-900 focus:ring-gray-200"
          }
          ${className}
        `}
        {...props}
      />

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}