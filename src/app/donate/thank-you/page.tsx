import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Thank You',
  description: 'Thank you for your donation.',
}

export default function ThankYouPage() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="font-serif font-light text-xl tracking-tight text-zinc-100">
          IRIS
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 pt-20">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl px-8 py-14 sm:px-14 max-w-lg w-full text-center">
          <div className="flex flex-col items-center gap-6 animate-fade-up">
            {/* Gold glow icon */}
            <div className="w-20 h-20 rounded-full border border-gold-500/40 bg-gold-500/10 flex items-center justify-center">
              <span className="text-3xl text-gold-400" aria-hidden="true">&#10029;</span>
            </div>

            <h1 className="font-serif font-light text-4xl text-text-primary leading-tight">
              Thank you, Guiding Light.
            </h1>

            <p className="font-sans text-base text-text-secondary leading-relaxed max-w-sm">
              Your gift is now sponsoring someone&apos;s recovery journey.
              Every day they rise is a day you helped shine.
            </p>

            <Link
              href="/"
              className="mt-4 bg-white/10 border border-white/20 text-white font-sans font-medium px-8 py-4 rounded-xl hover:bg-white/20 backdrop-blur-md active:scale-[0.98] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
