"use client"

import Image from "next/image"
import Link from "next/link"
import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
} from "react"

import {
  initialCheckoutForm,
  type CheckoutForm,
  type CheckoutFormErrors,
} from "@/app/checkout/types"
import {
  hasCheckoutErrors,
  validateCheckoutForm,
} from "@/app/checkout/validation"
import { useCart } from "@/components/cart/CartProvider"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import Select from "@/components/ui/Select"
import { useRouter } from "next/navigation"

const SHIPPING_FEE = 100
const FREE_SHIPPING_THRESHOLD = 500

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value)
}

export default function CheckoutPage() {
  const {
  items,
  itemCount,
  subtotal,
  clearCart,
} = useCart()

const router = useRouter()

  const [form, setForm] =
  useState<CheckoutForm>(initialCheckoutForm)

const [errors, setErrors] =
  useState<CheckoutFormErrors>({})

const [isSubmitting, setIsSubmitting] =
  useState(false)

const [submitError, setSubmitError] =
  useState("")

  const shipping = useMemo(() => {
    if (
      subtotal === 0 ||
      subtotal >= FREE_SHIPPING_THRESHOLD
    ) {
      return 0
    }

    return SHIPPING_FEE
  }, [subtotal])

  const total = subtotal + shipping

  function updateField(
    field: keyof CheckoutForm,
    value: string
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }))
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const field = event.target.name as keyof CheckoutForm

    updateField(field, event.target.value)
  }

  function handleSelectChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    const field = event.target.name as keyof CheckoutForm

    updateField(field, event.target.value)
  }

  async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault()

  setSubmitError("")

  const validationErrors =
    validateCheckoutForm(form)

  setErrors(validationErrors)

  if (hasCheckoutErrors(validationErrors)) {
    const firstInvalidField =
      Object.keys(validationErrors)[0]

    document
      .getElementById(firstInvalidField)
      ?.focus()

    return
  }

  if (items.length === 0) {
    setSubmitError(
      "Your cart is empty. Add a product before checking out."
    )

    return
  }

  setIsSubmitting(true)

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,

        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "We could not create your order."
      )
    }

    clearCart()

    router.push(
  `/payment/${encodeURIComponent(result.order.id)}`
)
  } catch (error) {
    console.error("Checkout failed:", error)

    setSubmitError(
      error instanceof Error
        ? error.message
        : "We could not create your order. Please try again."
    )
  } finally {
    setIsSubmitting(false)
  }
}

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Add products to your cart before continuing to
            checkout.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Checkout
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]"
        >
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer details
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Enter the contact details we should use for
                  your order.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName" required>
                    First name
                  </Label>

                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    autoComplete="given-name"
                    placeholder="Lerato"
                    error={errors.firstName}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" required>
                    Last name
                  </Label>

                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    autoComplete="family-name"
                    placeholder="Moshabi"
                    error={errors.lastName}
                  />
                </div>

                <div>
                  <Label htmlFor="email" required>
                    Email address
                  </Label>

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    placeholder="name@example.com"
                    error={errors.email}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" required>
                    Phone number
                  </Label>

                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="071 234 5678"
                    error={errors.phone}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Shipping address
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Enter the address where your order should be
                  delivered.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="addressLine1" required>
                    Address line 1
                  </Label>

                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleInputChange}
                    autoComplete="address-line1"
                    placeholder="Street address"
                    error={errors.addressLine1}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="addressLine2">
                    Address line 2
                  </Label>

                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleInputChange}
                    autoComplete="address-line2"
                    placeholder="Apartment, unit or complex"
                    error={errors.addressLine2}
                  />
                </div>

                <div>
                  <Label htmlFor="city" required>
                    City or town
                  </Label>

                  <Input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    autoComplete="address-level2"
                    placeholder="Paarl"
                    error={errors.city}
                  />
                </div>

                <div>
                  <Label htmlFor="province" required>
                    Province
                  </Label>

                  <Select
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleSelectChange}
                    autoComplete="address-level1"
                    error={errors.province}
                  >
                    <option value="" disabled>
                      Select a province
                    </option>
                    <option value="Eastern Cape">
                      Eastern Cape
                    </option>
                    <option value="Free State">
                      Free State
                    </option>
                    <option value="Gauteng">
                      Gauteng
                    </option>
                    <option value="KwaZulu-Natal">
                      KwaZulu-Natal
                    </option>
                    <option value="Limpopo">
                      Limpopo
                    </option>
                    <option value="Mpumalanga">
                      Mpumalanga
                    </option>
                    <option value="North West">
                      North West
                    </option>
                    <option value="Northern Cape">
                      Northern Cape
                    </option>
                    <option value="Western Cape">
                      Western Cape
                    </option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="postalCode" required>
                    Postal code
                  </Label>

                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleInputChange}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="7646"
                    error={errors.postalCode}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold text-gray-900">
              Order summary
            </h2>

            <div className="mt-6 max-h-[360px] space-y-5 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="line-clamp-2 text-sm font-medium text-gray-900 hover:underline"
                    >
                      {item.name}
                    </Link>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatPrice(
                        item.price * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shipping === 0
                    ? "Free"
                    : formatPrice(shipping)}
                </span>
              </div>

              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                  Add{" "}
                  {formatPrice(
                    FREE_SHIPPING_THRESHOLD - subtotal
                  )}{" "}
                  more to qualify for free shipping.
                </p>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {submitError && (
  <div
    role="alert"
    className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
  >
    {submitError}
  </div>
)}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting
                ? "Creating order..."
                : "Continue to payment"}
            </button>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Return to cart
            </Link>
          </aside>
        </form>
      </div>
    </section>
  )
}