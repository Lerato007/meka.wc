import Image from "next/image"
import Link from "next/link"
import {
  CreditCard,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react"

const benefits = [
  {
    title: "Secure payments",
    description:
      "Complete your purchase safely through PayFast.",
    icon: ShieldCheck,
  },
  {
    title: "Quality products",
    description:
      "Carefully selected products designed for modern style.",
    icon: ShoppingBag,
  },
  {
    title: "Order tracking",
    description:
      "Follow your order from payment through delivery.",
    icon: PackageCheck,
  },
  {
    title: "Simple checkout",
    description:
      "A quick and convenient online shopping experience.",
    icon: CreditCard,
  },
]

export default function OfficialLanding() {
  return (
    <main className="bg-white">
      <section className="relative isolate overflow-hidden bg-stone-100">
        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-gray-500">
              Meka.WC official collection
            </p>

            <h1 className="mt-5 text-5xl font-black tracking-tight text-gray-950 sm:text-6xl">
              Dress with confidence.
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover modern clothing and lifestyle products
              created for everyday comfort, confidence and
              effortless style.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="btn-primary rounded-full px-7"
              >
                Shop now
              </Link>

              <Link
                href="/register"
                className="btn-secondary rounded-full px-7"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-lg items-center justify-center">
            <div className="absolute h-80 w-80 rounded-full bg-emerald-100 blur-3xl" />

            <Image
              src="/mekalogo.png"
              alt="Meka.WC"
              width={420}
              height={420}
              priority
              className="relative h-auto w-full max-w-sm object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                Explore the store
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Find your next favourite item
              </h2>
            </div>

            <Link
              href="/products"
              className="font-semibold text-gray-700 hover:text-gray-950 hover:underline"
            >
              View all products →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <CategoryCard
              title="New arrivals"
              description="Explore the newest products available from Meka.WC."
              href="/products?sort=newest"
            />

            <CategoryCard
              title="Everyday style"
              description="Comfortable products selected for daily wear."
              href="/products"
            />

            <CategoryCard
              title="Customer favourites"
              description="Discover products customers have saved and purchased."
              href="/products"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Why Meka.WC
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
              Shopping made simple
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <article
                  key={benefit.title}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-800" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-950">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {benefit.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gray-950 px-6 py-14 text-center text-white sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/60">
            The store is open
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Find something made for you.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/70">
            Browse the Meka.WC collection, save your favourites
            and enjoy secure online checkout.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-white px-7 py-3 font-bold text-gray-950 transition hover:bg-gray-100"
          >
            Start shopping
          </Link>
        </div>
      </section>
    </main>
  )
}

type CategoryCardProps = {
  title: string
  description: string
  href: string
}

function CategoryCard({
  title,
  description,
  href,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
    >
      <h3 className="text-2xl font-bold text-gray-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>

      <span className="mt-8 inline-flex font-semibold text-gray-800 transition group-hover:translate-x-1">
        Shop collection →
      </span>
    </Link>
  )
}