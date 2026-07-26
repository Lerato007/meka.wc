// components/auth/SignOutButton.tsx
"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
    >
      Sign out
    </button>
  )
}