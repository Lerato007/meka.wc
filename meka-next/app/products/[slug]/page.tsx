import Link from "next/link"
import { notFound } from "next/navigation"

import { auth } from "@/auth"

import WishlistButton from "@/components/products/WishlistButton"
import ReviewForm from "@/components/reviews/ReviewForm"
import ReviewList from "@/components/reviews/ReviewList"
import StarRating from "@/components/reviews/StarRating"

import { getProductBySlug } from "@/lib/services/product-service"
import {
  getAverageRating,
  getProductReviews,
  getUserReview,
} from "@/lib/services/review-service"
import { isProductInWishlist } from "@/lib/services/wishlist-service"

import AddToCartButton from "./AddToCartButton"
import ProductImageGallery from "./ProductImageGallery"

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params

  const product =
    await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const session = await auth()
  const userId = session?.user?.id

  const [
    ratingSummary,
    reviews,
    initialWishlisted,
    userReview,
  ] = await Promise.all([
    getAverageRating(product.id),

    getProductReviews(product.id),

    userId
      ? isProductInWishlist(
          userId,
          product.id
        )
      : Promise.resolve(false),

    userId
      ? getUserReview(
          userId,
          product.id
        )
      : Promise.resolve(null),
  ])

  const formattedPrice =
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(Number(product.price))

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <Link
            href="/products"
            className="transition hover:text-gray-950"
          >
            Products
          </Link>

          <span aria-hidden="true">
            /
          </span>

          <span className="text-gray-950">
            {product.name}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

          <div className="lg:py-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              {product.category.name}
            </p>

            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                {product.name}
              </h1>

              <WishlistButton
                productId={product.id}
                initialWishlisted={
                  initialWishlisted
                }
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StarRating
                rating={
                  ratingSummary.average
                }
                size="md"
              />

              <span className="text-sm text-gray-600">
                {ratingSummary.average.toFixed(
                  1
                )}{" "}
                (
                {ratingSummary.count}{" "}
                {ratingSummary.count === 1
                  ? "review"
                  : "reviews"}
                )
              </span>
            </div>

            <p className="mt-6 text-3xl font-bold text-gray-950">
              {formattedPrice}
            </p>

            <div className="my-8 border-t border-gray-200" />

            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                Product description
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                {product.description}
              </p>
            </div>

            <div className="mt-10 rounded-xl bg-white p-5 ring-1 ring-gray-200">
              <p className="font-semibold text-gray-950">
                Add this product to your
                cart
              </p>

              <p className="mt-1 text-sm text-gray-600">
                You can review quantities
                before checkout.
              </p>

              <div className="mt-5">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: Number(
                      product.price
                    ),
                    imageUrl:
                      product.images[0]
                        ?.url ?? null,
                  }}
                />
              </div>
            </div>

            <Link
              href="/products"
              className="mt-8 inline-flex text-sm font-semibold text-gray-700 transition hover:text-gray-950"
            >
              ← Back to all products
            </Link>
          </div>
        </div>

        <section className="mt-16 border-t border-gray-200 pt-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-950">
              Customer reviews
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StarRating
                rating={
                  ratingSummary.average
                }
                size="lg"
              />

              <p className="text-gray-600">
                Based on{" "}
                {ratingSummary.count}{" "}
                {ratingSummary.count === 1
                  ? "review"
                  : "reviews"}
              </p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div>
              <ReviewForm
                productId={product.id}
                initialRating={
                  userReview?.rating ?? 0
                }
                initialComment={
                  userReview?.comment ?? ""
                }
              />
            </div>

            <div>
              <ReviewList
                reviews={reviews}
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}