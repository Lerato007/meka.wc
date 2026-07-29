import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"

import { createAddress } from "../actions"

type NewAddressPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const inputClasses =
  "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"

export default async function NewAddressPage({
  searchParams,
}: NewAddressPageProps) {
  const { error } = await searchParams

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/account/addresses"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to saved addresses
      </Link>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-7 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <MapPin className="h-5 w-5 text-neutral-800" />
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
                My account
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                Add a delivery address
              </h1>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Save an address to make future checkouts quicker.
              </p>
            </div>
          </div>
        </div>

        <form action={createAddress} className="space-y-8 px-6 py-8 sm:px-8">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <fieldset>
            <legend className="text-base font-semibold text-neutral-950">
              Address details
            </legend>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-neutral-800">
                Address label
                <input
                  name="label"
                  type="text"
                  required
                  placeholder="Home or Work"
                  className={inputClasses}
                />
              </label>

              <label className="text-sm font-medium text-neutral-800">
                Recipient name
                <input
                  name="recipientName"
                  type="text"
                  required
                  placeholder="Full name"
                  className={inputClasses}
                />
              </label>

              <label className="text-sm font-medium text-neutral-800 sm:col-span-2">
                Phone number
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="e.g. 071 234 5678"
                  className={inputClasses}
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-base font-semibold text-neutral-950">
              Delivery location
            </legend>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-neutral-800 sm:col-span-2">
                Address line 1
                <input
                  name="addressLine1"
                  type="text"
                  required
                  placeholder="Street number and street name"
                  className={inputClasses}
                />
              </label>

              <label className="text-sm font-medium text-neutral-800 sm:col-span-2">
                Address line 2
                <input
                  name="addressLine2"
                  type="text"
                  placeholder="Apartment, building or unit number"
                  className={inputClasses}
                />
              </label>

              <label className="text-sm font-medium text-neutral-800">
                Suburb
                <input
                  name="suburb"
                  type="text"
                  required
                  placeholder="Suburb"
                  className={inputClasses}
                />
              </label>

              <label className="text-sm font-medium text-neutral-800">
                City or town
                <input
                  name="city"
                  type="text"
                  required
                  placeholder="City or town"
                  className={inputClasses}
                />
              </label>

              <label className="text-sm font-medium text-neutral-800">
                Province
                <select
                  name="province"
                  required
                  defaultValue=""
                  className={inputClasses}
                >
                  <option value="" disabled>
                    Select a province
                  </option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="Western Cape">Western Cape</option>
                </select>
              </label>

              <label className="text-sm font-medium text-neutral-800">
                Postal code
                <input
                  name="postalCode"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={4}
                  placeholder="7646"
                  className={inputClasses}
                />
              </label>
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/account/addresses"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Save address
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}