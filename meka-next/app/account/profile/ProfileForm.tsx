"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import {
  updateProfile,
  type ProfileFormState,
} from "./actions"

type ProfileFormProps = {
  name: string
  email: string
  phone: string
}

const initialState: ProfileFormState = {}

function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? "Saving changes..." : "Save changes"}
    </button>
  )
}

export default function ProfileForm({
  name,
  email,
  phone,
}: ProfileFormProps) {
  const [state, formAction] = useActionState(
    updateProfile,
    initialState,
  )

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-800"
        >
          Full name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          placeholder="Enter your full name"
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-800"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="mt-2 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-600"
        />

        <p className="mt-2 text-sm text-gray-500">
          Your email address is linked to your login account and cannot
          be changed here.
        </p>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-gray-800"
        >
          Phone number
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          maxLength={25}
          autoComplete="tel"
          placeholder="For example, 082 123 4567"
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
        />

        <p className="mt-2 text-sm text-gray-500">
          This number can be used when contacting you about an order.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Changes apply to your customer profile.
        </p>

        <SaveButton />
      </div>
    </form>
  )
}