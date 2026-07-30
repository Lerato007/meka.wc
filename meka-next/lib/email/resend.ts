import { Resend } from "resend"

function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    throw new Error(
      "Missing required environment variable: RESEND_API_KEY"
    )
  }

  return apiKey
}

export const resend = new Resend(getResendApiKey())