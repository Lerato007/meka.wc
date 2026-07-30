import Link from "next/link"

type AddressFormData = {
  label: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  suburb: string
  city: string
  province: string
  postalCode: string
}

type AddressFormProps = {
  action: (formData: FormData) => void | Promise<void>
  mode: "create" | "edit"
  error?: string
  initialData?: AddressFormData
}

const inputClasses =
  "mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
]

export default function AddressForm({
  action,
  mode,
  error,
  initialData,
}: AddressFormProps) {
  const isEditing = mode === "edit"

  return (
    <form action={action} className="space-y-8 px-6 py-8 sm:px-8">
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
              defaultValue={initialData?.label ?? ""}
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
              defaultValue={initialData?.recipientName ?? ""}
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
              defaultValue={initialData?.phone ?? ""}
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
              defaultValue={initialData?.addressLine1 ?? ""}
              placeholder="Street number and street name"
              className={inputClasses}
            />
          </label>

          <label className="text-sm font-medium text-neutral-800 sm:col-span-2">
            Address line 2
            <input
              name="addressLine2"
              type="text"
              defaultValue={initialData?.addressLine2 ?? ""}
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
              defaultValue={initialData?.suburb ?? ""}
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
              defaultValue={initialData?.city ?? ""}
              placeholder="City or town"
              className={inputClasses}
            />
          </label>

          <label className="text-sm font-medium text-neutral-800">
            Province
            <select
              name="province"
              required
              defaultValue={initialData?.province ?? ""}
              className={inputClasses}
            >
              <option value="" disabled>
                Select a province
              </option>

              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
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
              pattern="[0-9]{4}"
              defaultValue={initialData?.postalCode ?? ""}
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
          {isEditing ? "Save changes" : "Save address"}
        </button>
      </div>
    </form>
  )
}