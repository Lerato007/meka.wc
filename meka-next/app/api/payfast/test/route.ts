import { NextResponse } from "next/server"

import {
  createPayFastPaymentData,
  getPayFastProcessUrl,
} from "@/lib/payfast"

export async function GET() {
  try {
    const paymentData = createPayFastPaymentData({
      orderId: "sandbox-test-order",
      orderNumber: "MK-SANDBOX-TEST",
      total: 100,
      firstName: "Test",
      lastName: "Customer",
      email: "test@example.com",
      phone: "0823456789",
    })

    return NextResponse.json({
      success: true,
      processUrl: getPayFastProcessUrl(),
      paymentData,
    })
  } catch (error) {
    console.error("PayFast configuration test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "PayFast configuration failed.",
      },
      { status: 500 }
    )
  }
}