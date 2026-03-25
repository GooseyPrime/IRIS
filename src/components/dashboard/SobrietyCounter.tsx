'use client'

import { useSobrietyCounter } from '@/hooks/useSobrietyCounter'
import { pad2 } from '@/lib/sobriety'

interface SobrietyCounterProps {
  sobrietyDate: string | null
  displayName: string | null
}

export function SobrietyCounter({ sobrietyDate, displayName }: SobrietyCounterProps) {
  const { time, currentMilestone, nextMilestone, isReady } =
    useSobrietyCounter(sobrietyDate)

  const greeting = displayName ? `${displayName},` : null

  if (!isReady) {
    return <SobrietyCounterSkeleton />
  }

  if (!sobrietyDate) {
    return <NoDateState />
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center py-8">
      {/* Greeting */}
      {greeting && (
        <p className="font-sans text-sm text-text-muted uppercase tracking-[0.15em]">
          {greeting}
        </p>
      )}

      {/* Days — hero number */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="font-serif font-light leading-none tabular-nums"
          style={{ fontSize: 'clamp(5rem, 20vw, 10rem)' }}
          aria-live="polite"
          aria-label={`${time.days} days sober`}
        >
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #A48EFF 0%, #6B4CE6 50%, #5A3FD3 100%)',
            }}
          >
            {time.days}
          </span>
        </div>
        <p className="font-sans text-sm uppercase tracking-[0.25em] text-text-secondary">
          {time.days === 1 ? 'day' : 'days'} sober
        </p>
      </div>

      {/* Hours : Minutes : Seconds sub-counter */}
      <div
        className="flex items-center gap-3 font-sans tabular-nums"
        aria-label={`${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
      >
        <TimeUnit value={pad2(time.hours)} label="hr" />
        <Colon />
        <TimeUnit value={pad2(time.minutes)} label="min" />
        <Colon />
        <TimeUnit value={pad2(time.seconds)} label="sec" />
      </div>

      {/* Milestone badge */}
      {currentMilestone && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/40 bg-gold-500/10">
          <span className="text-gold-400 text-sm" aria-hidden="true">★</span>
          <span className="font-sans text-sm font-medium text-gold-300">
            {currentMilestone.label} milestone reached
          </span>
        </div>
      )}

      {/* Next milestone nudge */}
      {nextMilestone && (
        <p className="font-sans text-xs text-text-muted">
          Next milestone:{' '}
          <span className="text-iris-300 font-medium">{nextMilestone.label}</span>
          {' '}in{' '}
          <span className="text-iris-300 font-medium">
            {nextMilestone.days - time.days}{' '}
            {nextMilestone.days - time.days === 1 ? 'day' : 'days'}
          </span>
        </p>
      )}

      {!nextMilestone && currentMilestone && (
        <p className="font-sans text-xs text-text-muted">
          You&apos;ve reached every milestone. Keep going.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[3.5rem]">
      <span className="text-2xl font-medium text-text-primary">{value}</span>
      <span className="text-[0.6rem] uppercase tracking-[0.15em] text-text-muted">
        {label}
      </span>
    </div>
  )
}

function Colon() {
  return (
    <span className="text-xl font-light text-iris-700 mb-3" aria-hidden="true">
      :
    </span>
  )
}

function NoDateState() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="w-16 h-16 rounded-full border border-iris-800 flex items-center justify-center">
        <span className="text-2xl text-iris-600" aria-hidden="true">◇</span>
      </div>
      <div>
        <p className="font-serif text-2xl text-text-primary">
          Your journey is already underway
        </p>
        <p className="font-sans text-sm text-text-secondary mt-2 max-w-xs mx-auto leading-relaxed">
          Add your sobriety date in settings and we&apos;ll start counting every precious
          second for you.
        </p>
      </div>
      <a
        href="/settings"
        className="font-sans text-sm text-iris-400 hover:text-iris-300 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
      >
        Add sobriety date →
      </a>
    </div>
  )
}

function SobrietyCounterSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-8 animate-pulse" aria-hidden="true">
      <div className="h-32 w-48 rounded-2xl bg-iris-900/30" />
      <div className="flex items-center gap-3">
        <div className="h-8 w-14 rounded-lg bg-iris-900/20" />
        <div className="h-6 w-2 rounded bg-iris-900/20" />
        <div className="h-8 w-14 rounded-lg bg-iris-900/20" />
        <div className="h-6 w-2 rounded bg-iris-900/20" />
        <div className="h-8 w-14 rounded-lg bg-iris-900/20" />
      </div>
    </div>
  )
}
