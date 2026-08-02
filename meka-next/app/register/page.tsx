"use client"

import { FormEvent, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Unable to create your account.")
        return
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (!signInResult || signInResult.error) {
        router.push("/login")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Something went wrong while creating your account.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleRegister() {
    setError("")
    setIsGoogleLoading(true)

    try {
      await signIn("google", {
        callbackUrl: "/",
      })
    } catch {
      setError("Google sign-up could not be started.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
  <Link
    href="/"
    aria-label="Return to Meka.WC home"
    className="inline-flex flex-col items-center gap-3"
  >
    <Image
      src="/mekalogo.png"
      alt="Meka.WC logo"
      width={72}
      height={72}
      priority
      className="h-18 w-18 rounded-full object-contain"
    />

    <span className="text-2xl font-bold tracking-tight text-gray-950">
      Meka.WC
    </span>
  </Link>

  <h1 className="mt-6 text-2xl font-semibold text-gray-950">
    Create your account
  </h1>

  <p className="mt-2 text-sm text-gray-600">
    Join Meka.WC and start shopping today.
  </p>
</div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading || isSubmitting}
          className="btn-secondary w-full gap-3"
        >
          <span className="text-lg font-semibold">G</span>

          {isGoogleLoading
            ? "Connecting to Google..."
            : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Or
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              className="form-input"
            />
          </div>

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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="btn-primary w-full"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-gray-950 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}