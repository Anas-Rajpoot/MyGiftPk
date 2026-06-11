import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="font-display text-6xl uppercase tracking-widest text-wine">
        MYGIFT
      </h1>
      <p className="font-body text-stone text-center max-w-md">
        Headless WooCommerce store — Phase 0 scaffold is live.
      </p>
      <Link
        href="/styleguide"
        className="px-6 py-3 bg-wine text-ivory rounded-input font-body font-semibold text-sm tracking-wide hover:bg-wine-deep transition-colors"
      >
        View Styleguide →
      </Link>
    </main>
  )
}
