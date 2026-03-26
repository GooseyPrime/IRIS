import Link from 'next/link'
import { VineAnimationWrapper } from '@/components/landing/VineAnimationWrapper'

export const metadata = {
  title: 'IRIS — I Rise, I Shine',
  description: 'Your AI sobriety companion.',
}

export default function HomePage() {
  return (
    <>
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/5">
        <span className="font-serif font-light text-xl tracking-tight text-zinc-100">
          IRIS
        </span>
        <nav className="flex items-center gap-5">
          <Link
            href="/donate"
            className="font-sans text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors"
          >
            Donate
          </Link>
          <Link
            href="/login"
            className="font-sans text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex flex-col min-h-screen">
        {/* HERO */}
        <section className="relative flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <VineAnimationWrapper />
          </div>

          <div className="relative z-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl px-8 py-14 sm:px-14 max-w-2xl w-full">
            <div className="flex flex-col items-center gap-8 text-center animate-fade-up">
              <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500">
                Your Journey Begins
              </p>

              <h1 className="font-serif font-light text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-[-0.03em] text-zinc-100 whitespace-nowrap">
                I Rise,{' '}
                <span className="bg-sacred-iris bg-clip-text text-transparent">
                  I Shine
                </span>
              </h1>

              <p className="font-sans text-lg leading-[1.7] text-zinc-400 max-w-md">
                A compassionate AI companion for your sobriety journey.
                Every day you rise is a day you shine.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/onboarding"
                  className="bg-white/10 border border-white/20 text-white font-sans font-medium px-8 py-4 rounded-xl hover:bg-white/20 backdrop-blur-md active:scale-[0.98] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Begin Your Journey
                </Link>
                <Link
                  href="/donate"
                  className="border border-gold-500/40 text-gold-400 font-sans font-medium px-8 py-4 rounded-xl hover:bg-gold-500/10 hover:text-gold-300 backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Become a Guiding Light
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IRIS WORKS */}
        <section className="px-6 py-20 bg-surface-1/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif font-semibold text-3xl text-center text-text-primary mb-12">
              How IRIS Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard
                number="01"
                title="Arrive"
                description="Answer a few questions so IRIS can understand your journey — your goals, your triggers, your preferred tone."
              />
              <StepCard
                number="02"
                title="Be Heard"
                description="Talk to IRIS any time. Morning check-ins, evening reflections, or just when you need someone who listens without judgement."
              />
              <StepCard
                number="03"
                title="Rise"
                description="Track your progress, celebrate milestones, and build resilience one day at a time with AI-guided support."
              />
            </div>
          </div>
        </section>

        {/* GUIDING LIGHT CTA */}
        <section className="px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface-1 border border-gold-500/20 rounded-3xl p-10 text-center">
              <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-4">
                Become a Guiding Light
              </p>
              <h2 className="font-serif font-light text-3xl text-text-primary mb-3">
                Sponsor someone&apos;s recovery for $0.62/month
              </h2>
              <p className="font-sans text-base text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
                Your donation gives someone who can&apos;t afford it a full year of
                AI-guided recovery support through IRIS.
              </p>
              <Link
                href="/donate"
                className="inline-block border border-gold-500/40 text-gold-400 font-sans font-medium px-8 py-4 rounded-xl hover:bg-gold-500/10 hover:text-gold-300 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Send a Guiding Light
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 px-6 py-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 font-sans text-sm text-text-muted">
              <Link href="/donate" className="hover:text-text-secondary transition-colors">
                Donate
              </Link>
              <Link href="/login" className="hover:text-text-secondary transition-colors">
                Sign In
              </Link>
              <Link href="/onboarding" className="hover:text-text-secondary transition-colors">
                Begin Journey
              </Link>
            </div>
            <p className="font-sans text-xs text-text-muted text-center max-w-lg leading-relaxed">
              IRIS is a wellness companion, not a therapist or treatment provider.
              If you are in crisis, please call 988 or text HOME to 741741.
            </p>
            <p className="font-sans text-xs text-text-muted">
              &copy; 2026 InTellMe AI / The IRIS Project
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center p-6">
      <span className="font-serif text-4xl font-light text-iris-600">{number}</span>
      <h3 className="font-serif font-semibold text-xl text-text-primary">{title}</h3>
      <p className="font-sans text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}
