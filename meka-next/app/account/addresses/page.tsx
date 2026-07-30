import Link from "next/link"
import { redirect } from "next/navigation"
import { Home, MapPin, Plus } from "lucide-react"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import { deleteAddress, setDefaultAddress } from "./actions"

export default async function AddressesPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account/addresses")
  }

  const customer = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      addresses: {
        orderBy: [
          {
            isDefault: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      },
    },
  })

  if (!customer) {
    redirect("/login?callbackUrl=/account/addresses")
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            My account
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
            Saved addresses
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Manage the delivery addresses connected to your account.
          </p>
        </div>

        <Link
          href="/account/addresses/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Add address
        </Link>
      </div>

      {customer.addresses.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <MapPin className="h-6 w-6 text-neutral-700" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-neutral-950">
            No saved addresses
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
            Save your first delivery address to make future checkouts quicker.
          </p>

          <Link
            href="/account/addresses/new"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Add your first address
          </Link>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {customer.addresses.map((address) => {
            const setDefaultAction = setDefaultAddress.bind(null, address.id)
            const deleteAction = deleteAddress.bind(null, address.id)

            return (
              <article
                key={address.id}
                className="relative rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                      <Home className="h-5 w-5 text-neutral-700" />
                    </div>

                    <div>
                      <h2 className="font-semibold text-neutral-950">
                        {address.label}
                      </h2>

                      {address.isDefault && (
                        <span className="mt-1 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          Default address
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-1 text-sm leading-6 text-neutral-600">
                  <p className="font-medium text-neutral-950">
                    {address.recipientName}
                  </p>

                  <p>{address.phone}</p>

                  <div className="pt-3">
                    <p>{address.addressLine1}</p>

                    {address.addressLine2 && <p>{address.addressLine2}</p>}

                    <p>{address.suburb}</p>

                    <p>
                      {address.city}, {address.province}
                    </p>

                    <p>{address.postalCode}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
                  <Link
                    href={`/account/addresses/${address.id}/edit`}
                    className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    Edit
                  </Link>

                  {!address.isDefault && (
                    <form action={setDefaultAction}>
                      <button
                        type="submit"
                        className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                      >
                        Set as default
                      </button>
                    </form>
                  )}

                  <form action={deleteAction}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}