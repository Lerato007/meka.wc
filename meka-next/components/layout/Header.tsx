import Link from "next/link"

import { auth, signOut } from "@/auth"
import CartButton from "@/components/layout/CartButton"

export default async function Header() {
  const session = await auth()

  const isSignedIn = Boolean(session?.user)
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-4 py-3">
        <Link
          href="/"
          className="shrink-0 text-2xl font-bold tracking-tight"
        >
          Meka.WC
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3 text-sm font-medium">
          <Link
            href="/"
            className="transition hover:text-gray-600"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="transition hover:text-gray-600"
          >
            Shop
          </Link>

          {isSignedIn && (
  <>
    <Link
      href="/wishlist"
      className="transition hover:text-gray-600"
    >
      Wishlist
    </Link>

    <Link
      href="/orders"
      className="transition hover:text-gray-600"
    >
      My Orders
    </Link>
  </>
)}

          {isAdmin && (
            <Link
              href="/admin"
              className="transition hover:text-gray-600"
            >
              Admin
            </Link>
          )}

          <CartButton />

          {!isSignedIn ? (
            <>
              <Link
                href="/login"
                className="transition hover:text-gray-600"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-gray-950 px-4 py-2 text-white transition hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="hidden text-gray-600 sm:inline">
                {session.user.name ??
                  session.user.email ??
                  "My account"}
              </span>

              <form
                action={async () => {
                  "use server"

                  await signOut({
                    redirectTo: "/",
                  })
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-gray-300 px-4 py-2 transition hover:border-gray-950 hover:text-gray-950"
                >
                  Logout
                </button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}