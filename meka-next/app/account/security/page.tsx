"use client"

import { FormEvent, useState } from "react"

type ChangePasswordResponse = {
  success?: boolean
  message?: string
}

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] =
    useState("")
  const [isSubmitting, setIsSubmitting] =
    useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage("")
    setError("")

    if (newPassword.length < 8) {
      setError(
        "Your new password must be at least 8 characters long."
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.")
      return
    }

    if (currentPassword === newPassword) {
      setError(
        "Your new password must be different from your current password."
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        "/api/account/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      )

      const contentType =
        response.headers.get("content-type")

      if (!contentType?.includes("application/json")) {
        throw new Error(
          "The server returned an invalid response."
        )
      }

      const result =
        (await response.json()) as ChangePasswordResponse

      if (!response.ok) {
        throw new Error(
          result.message ||
            "We could not update your password."
        )
      }

      setMessage(
        result.message ||
          "Your password has been updated successfully."
      )

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
          My account
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Security
        </h1>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Change the password used to sign in to your account.
        </p>
      </div>

      <section className="max-w-2xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-neutral-950">
          Change password
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Enter your current password and choose a new one.
        </p>

        {message && (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Current password
            </label>

            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 disabled:bg-neutral-100"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              New password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 disabled:bg-neutral-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 disabled:bg-neutral-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Updating password..."
              : "Update password"}
          </button>
        </form>
      </section>
    </div>
  )
}