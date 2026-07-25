 import { getProductBySlug } from "@/lib/services/product-service"
import { notFound } from "next/navigation"
import Image from "next/image"



export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {

  const { slug } = await params

  const product = await getProductBySlug(slug)


  if (!product) {
    notFound()
  }


  return (
    <main className="max-w-5xl mx-auto p-8">

      <div className="grid md:grid-cols-2 gap-8">


        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <Image
src={product.images[0].url}
alt={product.name}
width={600}
height={600}
/>
        </div>


        <div>

          <h1 className="text-4xl font-bold">
            {product.name}
          </h1>


          <p className="mt-4 text-gray-600">
            {product.description}
          </p>


          <p className="mt-6 text-2xl font-bold">
            R {Number(product.price).toFixed(2)}
          </p>


          <p className="mt-3">
            Category:
            <span className="ml-2 font-medium">
              {product.category.name}
            </span>
          </p>


          <button
            className="mt-8 bg-black text-white px-6 py-3 rounded-lg"
          >
            Add to Cart
          </button>


        </div>

      </div>

    </main>
  )
}