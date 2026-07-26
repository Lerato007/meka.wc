"use client"

import Image from "next/image"
import { useState } from "react"

type ProductImage = {
  id: string
  url: string
  alt: string | null
}

type ProductImageGalleryProps = {
  images: ProductImage[]
  productName: string
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] ?? null)

  if (!selectedImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
        No product image available
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image) => {
            const isSelected = selectedImage.id === image.id

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImage(image)}
                aria-label={`View ${image.alt || productName}`}
                className={`relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-offset-2 transition ${
                  isSelected
                    ? "ring-2 ring-gray-950"
                    : "ring-1 ring-gray-200 hover:ring-gray-400"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || productName}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}