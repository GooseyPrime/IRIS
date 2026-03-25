export const metadata = {
  title: 'IRIS — I Rise, I Shine',
  description: 'Your AI sobriety companion.',
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 bg-surface-0">
      <div className="flex flex-col items-center gap-8 text-center max-w-2xl animate-fade-up">
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500">
          Your Journey Begins
        </p>

        <h1 className="font-serif font-light text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-[-0.03em] text-text-primary">
          I Rise,{' '}
          <span className="bg-sacred-iris bg-clip-text text-transparent">
            I Shine
          </span>
        </h1>

        <p className="font-sans text-[18px] leading-[1.7] text-text-secondary max-w-md">
          A compassionate AI companion for your sobriety journey. Every day counts.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/onboarding"
            className="bg-sacred-iris text-white font-sans font-medium px-8 py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
          >
            Begin Your Journey
          </a>
          <a
            href="/login"
            className="border border-iris-600 text-iris-400 font-sans font-medium px-8 py-4 rounded-xl hover:bg-iris-600/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
