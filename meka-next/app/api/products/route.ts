import { NextResponse } from "next/server"
import { getProducts } from "@/lib/services/product-service"


export async function GET() {
  try {
    const products = await getProducts()

    return NextResponse.json({
      success: true,
      products,
    })

  } catch (error) {

    console.error("PRODUCT ERROR:", error)

    return NextResponse.json(
      {
        success:false,
        message:"Failed to fetch products",
        error: String(error)
      },
      {
        status:500
      }
    )
}
}