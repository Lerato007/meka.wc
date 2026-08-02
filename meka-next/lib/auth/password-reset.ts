import { createHash, randomBytes } from "node:crypto"

export const PASSWORD_RESET_EXPIRY_HOURS = 1

export function generatePasswordResetToken() {
  const token = randomBytes(32).toString("hex")

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex")

  const expiresAt = new Date(
    Date.now() +
      PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000
  )

  return {
    token,
    tokenHash,
    expiresAt,
  }
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex")
}