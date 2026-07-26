type PriceValue =
  | number
  | string
  | {
      toString(): string
    }

export function formatPrice(value: PriceValue) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(value.toString()))
}