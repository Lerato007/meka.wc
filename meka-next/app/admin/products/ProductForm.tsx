"use client"

import { useActionState, useEffect, useState } from "react"

import {
  createProduct,
  type ProductFormState,
} from "./actions"

type CategoryOption = {
  id: string
  name: string
}

type ProductFormProps = {
  categories: CategoryOption[]
}

const initialState: ProductFormState = {}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function ProductForm({
  categories,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState
  )

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugWasEdited, setSlugWasEdited] = useState(false)

  useEffect(() => {
    if (!slugWasEdited) {
      setSlug(createSlug(name))
    }
  }, [name, slugWasEdited])

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Product name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Premium Black Hoodie"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Slug
        </label>

        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(event) => {
            setSlugWasEdited(true)
            setSlug(createSlug(event.target.value))
          }}
          placeholder="premium-black-hoodie"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
        />

        <p className="mt-2 text-sm text-gray-500">
          Product URL: /products/{slug || "product-slug"}
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          required
          rows={6}
          placeholder="Describe the product, material and important details."
          className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="categoryId"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Category
          </label>

          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue=""
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
          >
            <option value="" disabled>
              Select a category
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Price
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-500">
              R
            </span>

            <input
              id="price"
              name="price"
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="499.99"
              className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-4 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            />
          </div>
        </div>
      </div>

      <div>
  <label
    htmlFor="images"
    className="mb-2 block text-sm font-medium text-gray-800"
  >
    Product images
  </label>

  <input
    id="images"
    name="images"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-800 hover:file:bg-gray-200"
  />

  <p className="mt-2 text-sm text-gray-500">
    Upload up to 5 JPG, PNG or WebP images. Maximum 5 MB per image.
  </p>
</div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating product..." : "Create product"}
        </button>
      </div>
    </form>
  )
}