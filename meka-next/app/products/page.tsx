import { getProducts } from "@/lib/services/product-service"
import Link from "next/link"


export default async function ProductsPage() {

  const products = await getProducts()


  return (
    <main className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Products
      </h1>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="border rounded-lg p-5"
          >

<Link href={`/products/${product.slug}`}>
  <h2 className="text-xl font-semibold">
    {product.name}
  </h2>
</Link>


            <p className="text-gray-600 mt-2">
              {product.description}
            </p>


            <p className="font-bold mt-4">
              R {Number(product.price).toFixed(2)}
            </p>


            <p className="text-sm mt-2">
              Category: {product.category.name}
            </p>

          </div>

        ))}

      </div>

    </main>
  )
}