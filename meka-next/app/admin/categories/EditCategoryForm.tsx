"use client"

import { useActionState } from "react"

import {
  updateCategory,
  type CategoryFormState,
} from "./actions"

type EditCategoryFormProps = {
  category: {
    id: string
    name: string
  }
}

const initialState: CategoryFormState = {}

export default function EditCategoryForm({
  category,
}: EditCategoryFormProps) {
  const updateCategoryWithId = updateCategory.bind(
    null,
    category.id
  )

  const [state, formAction, isPending] = useActionState(
    updateCategoryWithId,
    initialState
  )

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

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
          defaultValue={category.name}
          className="block w-full rounded-lg border border-gray-300 px-4 py-3"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gray-950 px-4 py-3 text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  )
}