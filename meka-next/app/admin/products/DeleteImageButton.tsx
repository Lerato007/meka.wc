"use client"

import { useTransition } from "react"

import { deleteProductImage } from "./actions"

type DeleteImageButtonProps = {
  imageId: string
}

export default function DeleteImageButton({
  imageId,
}: DeleteImageButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    )

    if (!confirmed) {
      return
    }

    startTransition(async () => {
      try {
        await deleteProductImage(imageId)
      } catch (error) {
        console.error(error)
        alert("Failed to delete image.")
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="mt-3 w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  )
}