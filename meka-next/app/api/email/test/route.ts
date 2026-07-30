import { NextResponse } from "next/server"

import { resend } from "@/lib/email/resend"
import { TestEmail } from "@/lib/email/templates/test-email"

export const runtime = "nodejs"

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    )
  }

  return value
}

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message:
            "The email test endpoint is disabled in production.",
        },
        { status: 403 }
      )
    }

    const from = getRequiredEnvironmentVariable(
      "EMAIL_FROM"
    )

    const recipient = getRequiredEnvironmentVariable(
      "EMAIL_TEST_RECIPIENT"
    )

    const { data, error } = await resend.emails.send({
      from,
      to: [recipient],
      subject: "Meka.WC email test",
      react: TestEmail({
        firstName: "Lerato",
      }),
    })

    if (error) {
      console.error("Resend email test failed:", error)

      return NextResponse.json(
        {
          success: false,
          message: "Resend rejected the email request.",
          error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully.",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("Email test route failed:", error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    )
  }
}