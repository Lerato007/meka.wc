"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useMemo, useState } from "react"

import { useCart } from "@/components/cart/CartProvider"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import Select from "@/components/ui/Select"

const SHIPPING_FEE = 100
const FREE_SHIPPING_THRESHOLD = 500

type CheckoutForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
}

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value)
}

export default function CheckoutPage() {
  const { items, itemCount, subtotal } = useCart()

  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shipping = useMemo(() => {
    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0
    }

    return SHIPPING_FEE
  }, [subtotal])

  const total = subtotal + shipping

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    console.log({
      customer: form,
      items,
      subtotal,
      shipping,
      total,
    })

    setTimeout(() => {
      setIsSubmitting(false)
      alert("Checkout form submitted successfully.")
    }, 500)
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Add products to your cart before continuing to checkout.
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
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Checkout
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]"
        >
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer details
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Enter the contact details we should use for your order.
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
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    autoComplete="given-name"
                    placeholder="Lerato"
                    required
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
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    autoComplete="family-name"
                    placeholder="Moshabi"
                    required
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
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
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
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    autoComplete="tel"
                    placeholder="071 234 5678"
                    required
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
                  Enter the address where your order should be delivered.
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
                    onChange={(event) =>
                      updateField("addressLine1", event.target.value)
                    }
                    autoComplete="address-line1"
                    placeholder="Street address"
                    required
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
                    onChange={(event) =>
                      updateField("addressLine2", event.target.value)
                    }
                    autoComplete="address-line2"
                    placeholder="Apartment, unit or complex"
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
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    autoComplete="address-level2"
                    placeholder="Paarl"
                    required
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
                    onChange={(event) =>
                      updateField("province", event.target.value)
                    }
                    autoComplete="address-level1"
                    required
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
                    onChange={(event) =>
                      updateField("postalCode", event.target.value)
                    }
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="7646"
                    required
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
                <div key={item.productId} className="flex gap-4">
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
                      {formatPrice(item.price * item.quantity)}
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
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>

              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more to
                  qualify for free shipping.
                </p>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "Processing..." : "Continue to payment"}
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