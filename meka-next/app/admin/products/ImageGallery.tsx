import Image from "next/image"

type ProductImage = {
  id: string
  url: string
  alt: string | null
  order: number
}

type ImageGalleryProps = {
  images: ProductImage[]
}

export default function ImageGallery({
  images,
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        This product has no images.
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Product Images
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={image.url}
                alt={image.alt ?? `Product image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-3">
              <p className="text-xs text-gray-500">
                Image {index + 1}
              </p>

              {index === 0 && (
                <span className="mt-2 inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                  Primary Image
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}