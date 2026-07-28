"use client"

import {
  FormEvent,
  useState,
} from "react"
import { useRouter } from "next/navigation"

type ReviewFormProps = {
  productId: string
  initialRating?: number
  initialComment?: string
}

export default function ReviewForm({
  productId,
  initialRating = 0,
  initialComment = "",
}: ReviewFormProps) {
  const router = useRouter()

  const [rating, setRating] =
    useState(initialRating)

  const [comment, setComment] =
    useState(initialComment)

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState("")

  const [error, setError] =
    useState("")

  async function submitReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (loading) return

    setMessage("")
    setError("")

    if (rating < 1 || rating > 5) {
      setError("Please select a rating.")
      return
    }

    const trimmedComment = comment.trim()

    if (!trimmedComment) {
      setError("Please enter a review comment.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId,
            rating,
            comment: trimmedComment,
          }),
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (!response.ok) {
        setError(
          data.message ??
            "Unable to submit your review."
        )
        return
      }

      setMessage(
        data.updated
          ? "Your review has been updated."
          : "Thank you for your review."
      )

      router.refresh()
    } catch {
      setError(
        "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submitReview}
      className="rounded-xl bg-white p-6 ring-1 ring-gray-200"
    >
      <h2 className="text-xl font-semibold text-gray-950">
        Write a review
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Only customers who purchased this
        product can submit a review.
      </p>

      <div className="mt-5">
        <p className="text-sm font-medium text-gray-700">
          Your rating
        </p>

        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setRating(star)
                }
                aria-label={`Rate ${star} out of 5`}
                aria-pressed={
                  star <= rating
                }
                className="text-3xl text-amber-500 transition hover:scale-110"
              >
                {star <= rating
                  ? "★"
                  : "☆"}
              </button>
            )
          )}
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="review-comment"
          className="text-sm font-medium text-gray-700"
        >
          Comment
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) =>
            setComment(
              event.target.value
            )
          }
          rows={5}
          maxLength={1000}
          placeholder="Share your experience with this product..."
          className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-950"
        />

        <p className="mt-1 text-right text-xs text-gray-500">
          {comment.length}/1000
        </p>
      </div>

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-4 text-sm font-medium text-green-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : initialRating > 0
            ? "Update Review"
            : "Submit Review"}
      </button>
    </form>
  )
}