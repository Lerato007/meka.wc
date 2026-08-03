import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Heart,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Package,
  UserRound,
} from "lucide-react"

import { auth, signOut } from "@/auth"

const accountLinks = [
  {
    href: "/account",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/account/orders",
    label: "Orders",
    icon: Package,
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    href: "/account/security",
    label: "Security",
    icon: LockKeyhole,
  },
]

type AccountLayoutProps = {
  children: React.ReactNode
}

export default async function AccountLayout({
  children,
}: AccountLayoutProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent("/account")}`
    )
  }

  async function handleSignOut() {
    "use server"

    await signOut({
      redirectTo: "/",
    })
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside>
          <nav className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-5 py-5">
              <p className="font-semibold text-neutral-950">
                My account
              </p>

              <p className="mt-1 truncate text-sm text-neutral-500">
                {session.user.email}
              </p>
            </div>

            <div className="space-y-1 p-3">
              {accountLinks.map((link) => {
                const Icon = link.icon

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-neutral-200 p-3">
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        <section className="min-w-0">
          {children}
        </section>
      </div>
    </main>
  )
}