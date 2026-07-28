type StarRatingProps = {
  rating: number
  size?: "sm" | "md" | "lg"
}

export default function StarRating({
  rating,
  size = "md",
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  const sizeClass = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  }[size]

  return (
    <div className={`flex items-center gap-1 ${sizeClass}`}>
      {stars.map((star) => (
        <span key={star}>
          {star <= Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
    </div>
  )
}