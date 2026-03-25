'use client'

import type { CrisisTier } from '@/lib/crisis-detection'

interface CrisisBannerProps {
  tier: CrisisTier
  onDismiss: () => void
}

export function CrisisBanner({ tier, onDismiss }: CrisisBannerProps) {
  if (tier === null) return null

  const tierLabel = tier === 1 ? 'Urgent' : tier === 2 ? 'Important' : 'Notice'
  const borderColor =
    tier === 1
      ? 'border-error/60'
      : tier === 2
        ? 'border-gold-500/60'
        : 'border-iris-500/60'
  const bgColor =
    tier === 1
      ? 'bg-error/10'
      : tier === 2
        ? 'bg-gold-500/10'
        : 'bg-iris-500/10'
  const labelColor =
    tier === 1
      ? 'text-error'
      : tier === 2
        ? 'text-gold-400'
        : 'text-iris-400'

  return (
    <div
      className={`mx-4 mb-3 p-4 rounded-xl border ${borderColor} ${bgColor}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p
            className={`font-sans text-xs font-semibold uppercase tracking-wider ${labelColor} mb-1`}
          >
            {tierLabel}
          </p>
          <p className="font-sans text-xs text-text-secondary leading-relaxed">
            Crisis resources have been provided in the chat. You are not
            alone — help is available 24/7.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded"
          aria-label="Dismiss banner"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
