export const metadata = {
  title: 'IRIS — I Rise, I Shine',
  description: 'Your AI sobriety companion.',
}

export default function HomePage() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/5">
        <span className="font-serif font-light text-xl tracking-tight text-zinc-100">
          IRIS
        </span>
        <nav className="flex items-center gap-6">
          <a
            href="/donate"
            className="text-sm uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-200"
          >
            Sponsor a User
          </a>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 pt-20">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl px-8 py-14 sm:px-14 max-w-2xl w-full">
          <div className="flex flex-col items-center gap-8 text-center animate-fade-up">
            <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500">
              Your Journey Begins
            </p>

            <h1 className="font-serif font-light text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-[-0.03em] text-zinc-100">
              I Rise,{' '}
              <span className="bg-sacred-iris bg-clip-text text-transparent">
                I Shine
              </span>
            </h1>

            <p className="font-sans text-lg leading-[1.7] text-zinc-400 max-w-md">
              A compassionate AI companion for your sobriety journey. Every day counts.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="/onboarding"
                className="bg-white/10 border border-white/20 text-white font-sans font-medium px-8 py-4 rounded-xl hover:bg-white/20 backdrop-blur-md active:scale-[0.98] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Begin Your Journey
              </a>
              <a
                href="/login"
                className="border border-white/10 text-zinc-300 font-sans font-medium px-8 py-4 rounded-xl hover:bg-white/10 hover:text-white backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
