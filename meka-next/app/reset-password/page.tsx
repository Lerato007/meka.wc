"use client"

import { FormEvent, Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type ResetPasswordResponse = {
  success?: boolean
  message?: string
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
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

    if (!token) {
      setError(
        "This password reset link is invalid or incomplete."
      )
      return
    }

    if (password.length < 8) {
      setError(
        "Your password must be at least 8 characters long."
      )
      return
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
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
        (await response.json()) as ResetPasswordResponse

      if (!response.ok) {
        throw new Error(
          result.message ||
            "We could not reset your password."
        )
      }

      setMessage(
        result.message ||
          "Your password has been reset successfully."
      )

      setPassword("")
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-gray-950"
          >
            Meka.WC
          </Link>

          <h1 className="mt-6 text-2xl font-semibold text-gray-950">
            Reset your password
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Enter and confirm your new password below.
          </p>
        </div>

        {!token && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            This password reset link is invalid or
            incomplete.
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {message}

            <div className="mt-3">
              <Link
                href="/login"
                className="font-semibold underline"
              >
                Continue to sign in
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!message && (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                New password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={!token || isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-800"
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
                disabled={!token || isSubmitting}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={!token || isSubmitting}
              className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Resetting password..."
                : "Reset password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="font-semibold text-gray-950 underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}