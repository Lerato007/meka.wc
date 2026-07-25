import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const records = await prisma.databaseTest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      message: "PostgreSQL and Prisma are connected",
      records,
    })
  } catch (error) {
    console.error("Database connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      {
        status: 500,
      },
    )
  }
}