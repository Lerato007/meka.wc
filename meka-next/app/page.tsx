export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <section className="max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">
          Meka.WC
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          The Next.js migration has started
        </h1>

        <p className="mt-6 text-lg leading-8 text-neutral-300">
          This storefront is being migrated from MERN to Next.js, TypeScript,
          PostgreSQL, Prisma and Tailwind CSS.
        </p>

        <div className="mt-10">
          <button
            type="button"
            className="rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200"
          >
            View products
          </button>
        </div>
      </section>
    </main>
  )
}