export type CheckoutForm = {
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

export type CheckoutFormErrors = Partial<
  Record<keyof CheckoutForm, string>
>

export const initialCheckoutForm: CheckoutForm = {
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