"use client"

import { useActionState } from "react"

import {
  createCategory,
  type CategoryFormState,
} from "./actions"

const initialState: CategoryFormState = {}

export default function CategoryForm() {
  const [state, formAction, isPending] = useActionState(
    createCategory,
    initialState
  )

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Category name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={50}
          placeholder="For example: T-shirts"
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
        />

        <p className="mt-2 text-sm text-gray-500">
          This category will appear in the product category dropdown.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating category..." : "Create category"}
      </button>
    </form>
  )
}