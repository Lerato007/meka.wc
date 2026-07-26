import type {
  CheckoutForm,
  CheckoutFormErrors,
} from "@/app/checkout/types"

const SOUTH_AFRICAN_PHONE_PATTERN =
  /^(?:\+27|0)[6-8][0-9]{8}$/

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const POSTAL_CODE_PATTERN = /^[0-9]{4}$/

function normalisePhoneNumber(phone: string) {
  return phone.replace(/[\s()-]/g, "")
}

export function validateCheckoutForm(
  form: CheckoutForm
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {}

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required."
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = "First name must contain at least 2 characters."
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Last name is required."
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = "Last name must contain at least 2 characters."
  }

  const email = form.email.trim().toLowerCase()

  if (!email) {
    errors.email = "Email address is required."
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address."
  }

  const phone = normalisePhoneNumber(form.phone)

  if (!phone) {
    errors.phone = "Phone number is required."
  } else if (!SOUTH_AFRICAN_PHONE_PATTERN.test(phone)) {
    errors.phone = "Enter a valid South African phone number."
  }

  if (!form.addressLine1.trim()) {
    errors.addressLine1 = "Street address is required."
  } else if (form.addressLine1.trim().length < 5) {
    errors.addressLine1 = "Enter a complete street address."
  }

  if (!form.city.trim()) {
    errors.city = "City or town is required."
  }

  if (!form.province) {
    errors.province = "Select a province."
  }

  if (!form.postalCode.trim()) {
    errors.postalCode = "Postal code is required."
  } else if (!POSTAL_CODE_PATTERN.test(form.postalCode.trim())) {
    errors.postalCode = "Postal code must contain 4 digits."
  }

  return errors
}

export function hasCheckoutErrors(
  errors: CheckoutFormErrors
) {
  return Object.keys(errors).length > 0
}