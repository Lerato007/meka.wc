import { resend } from "@/lib/email/resend"
import PasswordResetEmail from "@/lib/email/templates/password-reset"

type SendPasswordResetEmailInput = {
  email: string
  name?: string | null
  token: string
}

type SendPasswordResetEmailResult = {
  success: true
  emailId: string | null
}

function getRequiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    )
  }

  return value
}

export async function sendPasswordResetEmail({
  email,
  name,
  token,
}: SendPasswordResetEmailInput): Promise<SendPasswordResetEmailResult> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanToken = token.trim()

  if (!cleanEmail) {
    throw new Error(
      "A valid recipient email address is required."
    )
  }

  if (!cleanToken) {
    throw new Error(
      "A valid password reset token is required."
    )
  }

  const emailFrom =
    getRequiredEnvironmentVariable("EMAIL_FROM")

  const appUrl =
    getRequiredEnvironmentVariable("APP_URL").replace(
      /\/$/,
      ""
    )

  const resetUrl =
    `${appUrl}/reset-password?token=${encodeURIComponent(
      cleanToken
    )}`

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: cleanEmail,
    subject: "Reset your Meka.WC password",
    react: (
      <PasswordResetEmail
        name={name}
        resetUrl={resetUrl}
      />
    ),
  })

  if (error) {
    throw new Error(
      `Resend failed to send the password reset email: ${error.message}`
    )
  }

  console.log("Password reset email sent.", {
    emailId: data?.id ?? null,
    recipient: cleanEmail,
  })

  return {
    success: true,
    emailId: data?.id ?? null,
  }
}