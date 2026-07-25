"use client"

import { useActionState, useState } from "react"

import {
  deleteCategory,
  type DeleteCategoryState,
} from "./actions"

type DeleteCategoryButtonProps = {
  category: {
    id: string
    name: string
    productCount: number
  }
}

const initialState: DeleteCategoryState = {}

export default function DeleteCategoryButton({
  category,
}: DeleteCategoryButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const deleteCategoryWithId = deleteCategory.bind(
    null,
    category.id
  )

  const [state, formAction, isPending] = useActionState(
    deleteCategoryWithId,
    initialState
  )

  if (!showConfirmation) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirmation(true)}
        className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
      >
        Delete
      </button>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-900">
        Delete “{category.name}”?
      </p>

      {category.productCount > 0 ? (
        <p className="mt-1 text-sm text-red-700">
          This category cannot be deleted because it contains{" "}
          {category.productCount}{" "}
          {category.productCount === 1 ? "product" : "products"}.
        </p>
      ) : (
        <p className="mt-1 text-sm text-red-700">
          This action cannot be undone.
        </p>
      )}

      {state.error ? (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <div className="mt-4 flex gap-3">
        {category.productCount === 0 ? (
          <form action={formAction}>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Deleting..." : "Confirm delete"}
            </button>
          </form>
        ) : null}

        <button
          type="button"
          onClick={() => setShowConfirmation(false)}
          disabled={isPending}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}