type OrderTimelineProps = {
  orderStatus: string
  paymentStatus: string
}

type TimelineStep = {
  label: string
  completed: boolean
  current: boolean
}

const ORDER_STATUS_LEVELS: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
}

export default function OrderTimeline({
  orderStatus,
  paymentStatus,
}: OrderTimelineProps) {
  const isCancelled = orderStatus === "CANCELLED"
  const isExpired =
    orderStatus === "EXPIRED" || paymentStatus === "EXPIRED"
  const currentLevel = ORDER_STATUS_LEVELS[orderStatus] ?? 0

  const steps: TimelineStep[] = [
    {
      label: "Order placed",
      completed: true,
      current: currentLevel === 0,
    },
    {
      label: "Payment received",
      completed:
        paymentStatus === "PAID" ||
        currentLevel >= ORDER_STATUS_LEVELS.PAID,
      current:
        paymentStatus === "PAID" &&
        currentLevel === ORDER_STATUS_LEVELS.PAID,
    },
    {
      label: "Processing",
      completed: currentLevel >= ORDER_STATUS_LEVELS.PROCESSING,
      current: currentLevel === ORDER_STATUS_LEVELS.PROCESSING,
    },
    {
      label: "Shipped",
      completed: currentLevel >= ORDER_STATUS_LEVELS.SHIPPED,
      current: currentLevel === ORDER_STATUS_LEVELS.SHIPPED,
    },
    {
      label: "Delivered",
      completed: currentLevel >= ORDER_STATUS_LEVELS.DELIVERED,
      current: currentLevel === ORDER_STATUS_LEVELS.DELIVERED,
    },
  ]

  return (
    <div>
      <ol className="space-y-0">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1

          return (
            <li
              key={step.label}
              className="relative flex gap-4"
            >
              {!isLastStep && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 h-full w-0.5 ${
                    step.completed
                      ? "bg-gray-900"
                      : "bg-gray-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  step.completed
                    ? "border-gray-950 bg-gray-950 text-white"
                    : step.current
                      ? "border-gray-950 bg-white text-gray-950"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step.completed ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10.5 8 14l8-9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>

              <div className="min-h-16 pb-6">
                <p
                  className={`pt-1 text-sm font-semibold ${
                    step.completed || step.current
                      ? "text-gray-950"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>

                {step.current &&
                  !isCancelled &&
                  !isExpired && (
                    <p className="mt-1 text-sm text-gray-500">
                      Current stage
                    </p>
                  )}
              </div>
            </li>
          )
        })}
      </ol>

      {isCancelled && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
              ×
            </div>

            <div>
              <p className="text-sm font-semibold text-red-900">
                Order cancelled
              </p>

              <p className="mt-1 text-sm text-red-700">
                This order is no longer being processed.
              </p>
            </div>
          </div>
        </div>
      )}

      {isExpired && (
        <div className="mt-2 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700">
              ×
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Order expired
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Payment was not completed before the order expired.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}