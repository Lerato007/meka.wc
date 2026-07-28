import StarRating from "@/components/reviews/StarRating"

type ReviewListProps = {
  reviews: {
    id: string
    rating: number
    comment: string
    createdAt: Date
    user: {
      id: string
      name: string | null
    }
  }[]
}

export default function ReviewList({
  reviews,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center ring-1 ring-gray-200">
        <h3 className="text-lg font-semibold text-gray-950">
          No reviews yet
        </h3>

        <p className="mt-2 text-sm text-gray-600">
          Customers who have purchased this product can leave the first
          review.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-xl bg-white p-6 ring-1 ring-gray-200"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-gray-950">
                {review.user.name || "Customer"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {new Intl.DateTimeFormat("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(review.createdAt))}
              </p>
            </div>

            <StarRating
              rating={review.rating}
              size="sm"
            />
          </div>

          <p className="mt-5 whitespace-pre-line leading-7 text-gray-700">
            {review.comment}
          </p>
        </article>
      ))}
    </div>
  )
}