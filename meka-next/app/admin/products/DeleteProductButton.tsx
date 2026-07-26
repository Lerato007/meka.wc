"use client"

import { useState, useTransition } from "react"

import { deleteProduct } from "@/app/admin/products/actions"

type DeleteProductButtonProps = {
  productId: string
  productName: string
}

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    setError("")

    startTransition(async () => {
      try {
        await deleteProduct(productId)
        setIsOpen(false)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "The product could not be deleted."
        )
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("")
          setIsOpen(true)
        }}
        className="font-medium text-red-600 transition hover:text-red-700"
      >
        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-950">
              Delete product?
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              You are about to delete{" "}
              <span className="font-medium text-gray-950">
                {productName}
              </span>
              . This action cannot be undone.
            </p>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {isPending ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}