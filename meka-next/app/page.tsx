import Link from "next/link"

import LaunchCountdown from "@/components/launch/LaunchCountdown"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section className="relative isolate overflow-hidden bg-gray-950">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="mx-auto flex min-h-[760px] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-white"
            >
              Meka.WC
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-white/25 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-950"
            >
              Sign in
            </Link>
          </header>

          <div className="flex flex-1 items-center py-16">
            <div className="mx-auto w-full max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">
                Something special is coming
              </p>

              <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                Style made for
                <span className="block text-white/70">
                  every moment.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Meka.WC is preparing a fresh collection designed
                to bring confidence, comfort and effortless style
                to your wardrobe.
              </p>

              <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8">
                <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/60">
                  Store launches in
                </p>

                <LaunchCountdown />
              </div>
            </div>
          </div>

          <div className="pb-4 text-center text-xs text-white/40">
            © 2026 Meka.WC. All rights reserved.
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
              What to expect
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              A new shopping experience is on the way
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              We are putting the final touches on our online
              store. Once we launch, you will be able to browse
              our collection, place secure orders and track your
              purchases from your account.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard
              number="01"
              title="Fresh collections"
              description="Carefully selected products created for modern, everyday style."
            />

            <FeatureCard
              number="02"
              title="Secure checkout"
              description="A simple and secure online payment experience powered by PayFast."
            />

            <FeatureCard
              number="03"
              title="Order tracking"
              description="Follow your order progress directly from your customer account."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">
              Already have an account?
            </h2>

            <p className="mt-2 text-gray-600">
              Sign in now and be ready when the store opens.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  )
}

type FeatureCardProps = {
  number: string
  title: string
  description: string
}

function FeatureCard({
  number,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <p className="text-sm font-black text-gray-400">
        {number}
      </p>

      <h3 className="mt-5 text-xl font-bold text-gray-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>
    </article>
  )
}