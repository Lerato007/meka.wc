import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorised.",
      },
      {
        status: 401,
      }
    )
  }

  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET || "product-images"

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list("", {
      limit: 10,
    })

  if (error) {
    console.error("Supabase Storage test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    )
  }

  return NextResponse.json({
    success: true,
    message: "Supabase Storage is connected.",
    bucket,
    files: data,
  })
}