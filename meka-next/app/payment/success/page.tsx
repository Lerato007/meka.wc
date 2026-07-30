import PaymentConfirmation from "@/components/payment/PaymentConfirmation"

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string
    order?: string
  }>
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { orderId, order } = await searchParams

  return (
    <PaymentConfirmation
      orderId={orderId ?? ""}
      fallbackOrderNumber={order}
    />
  )
}