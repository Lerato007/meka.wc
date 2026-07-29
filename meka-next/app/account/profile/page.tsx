import { redirect } from "next/navigation"

import { auth } from "@/auth"
import PageHeader from "@/components/ui/PageHeader"
import SummaryCard from "@/components/ui/SummaryCard"
import { prisma } from "@/lib/prisma"

import ProfileForm from "./ProfileForm"

export const dynamic = "force-dynamic"

type ProfilePageProps = {
  searchParams: Promise<{
    updated?: string
  }>
}

export default async function ProfilePage({
  searchParams,
}: ProfilePageProps) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account/profile")
  }

  const customer = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  })

  if (!customer?.email) {
    redirect("/login?callbackUrl=/account/profile")
  }

  const resolvedSearchParams = await searchParams
  const wasUpdated = resolvedSearchParams.updated === "true"

  const memberSince = new Intl.DateTimeFormat("en-ZA", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(customer.createdAt)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <PageHeader
            eyebrow="My Meka.WC account"
            title="Profile"
            description="Manage the personal information linked to your account."
            actionLabel="Back to account"
            actionHref="/account"
          />

          {wasUpdated && (
            <div
              role="status"
              className="mt-8 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              Your profile has been updated successfully.
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <SummaryCard title="Personal information">
              <ProfileForm
                name={customer.name ?? ""}
                email={customer.email}
                phone={customer.phone ?? ""}
              />
            </SummaryCard>

            <aside className="space-y-6">
              <SummaryCard title="Account details">
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">
                      Account email
                    </dt>

                    <dd className="mt-1 break-words font-semibold text-gray-950">
                      {customer.email}
                    </dd>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <dt className="font-medium text-gray-500">
                      Member since
                    </dt>

                    <dd className="mt-1 font-semibold text-gray-950">
                      {memberSince}
                    </dd>
                  </div>
                </dl>
              </SummaryCard>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="font-semibold text-gray-950">
                  Why keep this updated?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Accurate contact details help Meka.WC communicate
                  with you about payments, deliveries, and order
                  updates.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}