"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"

type ForgotPasswordResponse = {
  success?: boolean
  message?: string
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setIsSubmitting(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
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
        (await response.json()) as ForgotPasswordResponse

      if (!response.ok) {
        throw new Error(
          result.message ||
            "We could not process your request."
        )
      }

      setMessage(
        result.message ||
          "If an account exists for that email address, you will receive a password reset email shortly."
      )
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
            MekaWC
          </Link>

          <h1 className="mt-6 text-2xl font-semibold text-gray-950">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you
            a password reset link if an account exists.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {message}
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

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Sending reset link..."
              : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{" "}
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