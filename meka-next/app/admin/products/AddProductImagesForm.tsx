"use client"

import { useActionState, useRef } from "react"
import { useFormStatus } from "react-dom"

import {
  addProductImages,
  type ProductImageFormState,
} from "@/app/admin/products/actions"

type AddProductImagesFormProps = {
  productId: string
  currentImageCount: number
  maximumImageCount?: number
}

const initialState: ProductImageFormState = {}

function UploadButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? "Uploading..." : "Upload images"}
    </button>
  )
}

export default function AddProductImagesForm({
  productId,
  currentImageCount,
  maximumImageCount = 5,
}: AddProductImagesFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const uploadAction = addProductImages.bind(
    null,
    productId
  )

  const [state, formAction] = useActionState(
    uploadAction,
    initialState
  )

  const remainingImageSlots =
    maximumImageCount - currentImageCount

  if (remainingImageSlots <= 0) {
    return (
      <section className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-950">
          Add more images
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          This product already has the maximum of{" "}
          {maximumImageCount} images.
        </p>
      </section>
    )
  }

  return (
    <section className="border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-gray-950">
        Add more images
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        You can upload up to {remainingImageSlots} more{" "}
        {remainingImageSlots === 1 ? "image" : "images"}.
        JPG, PNG and WebP files are supported, with a maximum
        size of 5 MB each.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-5 space-y-4"
      >
        <div>
          <label
            htmlFor="additional-images"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Select images
          </label>

          <input
            id="additional-images"
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-800 hover:file:bg-gray-200"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {state.success}
          </p>
        )}

        <UploadButton />
      </form>
    </section>
  )
}