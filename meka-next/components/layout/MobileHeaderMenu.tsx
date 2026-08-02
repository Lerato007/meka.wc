"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

type MobileHeaderMenuProps = {
  isSignedIn: boolean
  isAdmin: boolean
  firstName: string
  signOutAction: () => Promise<void>
}

export default function MobileHeaderMenu({
  isSignedIn,
  isAdmin,
  firstName,
  signOutAction,
}: MobileHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen
      ? "hidden"
      : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-900 transition hover:bg-gray-100"
        aria-label={
          isOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-[69px] z-50 border-t border-gray-200 bg-white shadow-lg md:hidden">
          <nav className="mx-auto flex max-h-[calc(100vh-69px)] max-w-7xl flex-col overflow-y-auto px-4 py-5">
            <MobileLink href="/">
              Home
            </MobileLink>

            <MobileLink href="/products">
              Shop
            </MobileLink>

            {isAdmin && (
              <MobileLink href="/admin">
                Admin
              </MobileLink>
            )}

            {isSignedIn ? (
              <>
                <MobileLink href="/account">
                  My Account
                </MobileLink>

                <MobileLink href="/account/orders">
                  Orders
                </MobileLink>

                <MobileLink href="/account/wishlist">
                  Wishlist
                </MobileLink>

                <MobileLink href="/account/addresses">
                  Addresses
                </MobileLink>

                <div className="my-4 border-t border-gray-200" />

                <p className="mb-3 px-3 text-sm text-gray-500">
                  Signed in as {firstName}
                </p>

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="my-4 border-t border-gray-200" />

                <MobileLink href="/login">
                  Login
                </MobileLink>

                <Link
                  href="/register"
                  className="btn-primary mt-3 w-full"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

type MobileLinkProps = {
  href: string
  children: React.ReactNode
}

function MobileLink({
  href,
  children,
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition hover:bg-gray-100 hover:text-gray-950"
    >
      {children}
    </Link>
  )
}