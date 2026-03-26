'use client'

import { useState } from 'react'
import Link from 'next/link'

const TIERS = [
  { key: 'spark', name: 'Spark', amount: '$10/mo', impact: '1 user/year', mode: 'subscription' },
  { key: 'ember', name: 'Ember', amount: '$25/mo', impact: '3 users/year', mode: 'subscription' },
  { key: 'flame', name: 'Flame', amount: '$50/mo', impact: '6 users/year', mode: 'subscription' },
  { key: 'beacon', name: 'Beacon', amount: '$100/mo', impact: '13 users/year', mode: 'subscription' },
  { key: 'lighthouse', name: 'Lighthouse', amount: '$1,200', impact: '1 full year', mode: 'payment' },
] as const

export default function DonatePage() {
  const [calcAmount, setCalcAmount] = useState('')
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [targetedTier, setTargetedTier] = useState<string>('spark')
  const [targetedLoading, setTargetedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calcNum = parseFloat(calcAmount) || 0
  const usersSponsored = Math.floor((calcNum * 12) / 7.43)

  async function handleCheckout(tier: string, email?: string) {
    const loadingSetter = email ? setTargetedLoading : (v: boolean) => setLoadingTier(v ? tier : null)
    loadingSetter(true)
    setError(null)

    try {
      const res = await fetch('/api/donate/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, recipientEmail: email || undefined }),
      })

      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        loadingSetter(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Failed to connect. Please try again.')
      loadingSetter(false)
    }
  }

  return (
    <>
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="font-serif font-light text-xl tracking-tight text-zinc-100">
          IRIS
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/login"
            className="font-sans text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="min-h-screen pt-24 pb-16 px-6">
        {/* HERO */}
        <section className="max-w-2xl mx-auto text-center mb-16 animate-fade-up">
          <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-4">
            Become a Guiding Light
          </p>
          <h1 className="font-serif font-light text-4xl sm:text-5xl text-text-primary leading-tight mb-4">
            Your $10/month gives one person a full year of recovery support.
          </h1>
          <p className="font-sans text-base text-text-secondary max-w-md mx-auto leading-relaxed">
            Sponsor access to AI-guided recovery support for people who need it.
            Every contribution lights the way for someone in their journey.
          </p>
        </section>

        {/* IMPACT CALCULATOR */}
        <section className="max-w-md mx-auto mb-16">
          <div className="bg-surface-1 border border-iris-900/30 rounded-2xl p-6">
            <h2 className="font-sans text-sm text-text-secondary uppercase tracking-[0.15em] mb-4 text-center">
              Impact Calculator
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 w-full">
                <span className="font-sans text-text-muted text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  placeholder="Enter monthly amount"
                  className="flex-1 bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors [color-scheme:dark] text-center"
                />
                <span className="font-sans text-text-muted text-sm">/mo</span>
              </div>
              {calcNum > 0 && (
                <p className="font-serif text-xl text-gold-400 text-center">
                  Your ${calcNum}/month sponsors{' '}
                  <span className="font-semibold text-gold-300">{usersSponsored}</span>{' '}
                  {usersSponsored === 1 ? 'user' : 'users'} per year
                </p>
              )}
            </div>
          </div>
        </section>

        {/* TIER CARDS */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <button
                key={tier.key}
                type="button"
                disabled={loadingTier !== null}
                onClick={() => void handleCheckout(tier.key)}
                className={[
                  'flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                  'hover:border-gold-500/50 hover:bg-gold-500/5',
                  tier.key === 'lighthouse'
                    ? 'border-gold-500/30 bg-gold-500/5 sm:col-span-2 lg:col-span-1'
                    : 'border-iris-900/30 bg-surface-1',
                  loadingTier === tier.key ? 'opacity-70' : '',
                ].join(' ')}
              >
                <span className="font-serif font-semibold text-lg text-gold-400">{tier.name}</span>
                <span className="font-sans text-2xl font-light text-text-primary">{tier.amount}</span>
                <span className="font-sans text-xs text-text-muted uppercase tracking-[0.1em]">
                  {tier.impact}
                </span>
                <span className={[
                  'mt-2 px-5 py-2 rounded-xl font-sans text-sm font-medium transition-colors',
                  tier.key === 'lighthouse'
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                    : 'bg-iris-600/30 text-iris-200 border border-iris-500/30',
                ].join(' ')}>
                  {loadingTier === tier.key ? 'Redirecting…' : tier.mode === 'subscription' ? 'Subscribe' : 'Donate'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* TARGETED DONATION */}
        <section className="max-w-lg mx-auto mb-16">
          <div className="bg-surface-1 border border-iris-900/30 rounded-2xl p-8">
            <h2 className="font-serif font-semibold text-xl text-text-primary text-center mb-2">
              Know someone who could use IRIS?
            </h2>
            <p className="font-sans text-sm text-text-secondary text-center mb-6 leading-relaxed">
              Enter their email and we&apos;ll credit their account when they sign up.
            </p>

            <div className="flex flex-col gap-4">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="their@email.com"
                className="bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors"
              />

              <div className="flex flex-wrap gap-2 justify-center">
                {TIERS.map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setTargetedTier(tier.key)}
                    className={[
                      'px-4 py-2 rounded-full border font-sans text-xs font-medium transition-all duration-200',
                      targetedTier === tier.key
                        ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                        : 'border-iris-900/40 bg-surface-2 text-text-muted hover:border-iris-600/50',
                    ].join(' ')}
                  >
                    {tier.name} — {tier.amount}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!recipientEmail.includes('@') || targetedLoading}
                onClick={() => void handleCheckout(targetedTier, recipientEmail)}
                className="w-full px-6 py-3 rounded-xl border border-gold-500/40 text-gold-400 font-sans text-sm font-medium hover:bg-gold-500/10 hover:text-gold-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                {targetedLoading ? 'Redirecting…' : 'Send a Guiding Light'}
              </button>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-2xl mx-auto mb-16">
          <h2 className="font-serif font-semibold text-2xl text-text-primary text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HowStep number="1" title="You Give" description="Choose a tier or enter a custom amount. Payment is handled securely through Stripe." />
            <HowStep number="2" title="We Match" description="Your donation is matched to a user who needs recovery support but cannot afford it." />
            <HowStep number="3" title="They Get IRIS" description="The recipient receives free access to IRIS — AI-guided support for their sobriety journey." />
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <p className="font-sans text-sm text-error text-center" role="alert">{error}</p>
          </div>
        )}

        {/* FOOTER */}
        <footer className="max-w-2xl mx-auto text-center pt-8 border-t border-white/5">
          <p className="font-sans text-xs text-text-muted">
            IRIS is a wellness companion, not a medical device.
          </p>
        </footer>
      </main>
    </>
  )
}

function HowStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center p-4">
      <span className="w-10 h-10 rounded-full border border-gold-500/30 bg-gold-500/10 flex items-center justify-center font-serif text-lg text-gold-400">
        {number}
      </span>
      <h3 className="font-sans font-semibold text-sm text-text-primary">{title}</h3>
      <p className="font-sans text-xs text-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}
