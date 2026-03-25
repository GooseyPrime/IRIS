'use client'

import type { CrisisState } from '@/hooks/useChatSession'
import { CrisisResourceCard } from '@/components/crisis/CrisisResourceCard'

interface CrisisAlertProps {
  crisis: CrisisState
  onDismiss: () => void
}

export function CrisisAlert({ crisis, onDismiss }: CrisisAlertProps) {
  const isTier1 = crisis.tier === 1
  const isTier2 = crisis.tier === 2

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'mx-4 my-3 rounded-2xl border p-4 flex flex-col gap-3',
        isTier1
          ? 'border-error/40 bg-error/8'
          : isTier2
            ? 'border-gold-500/40 bg-gold-500/8'
            : 'border-iris-600/40 bg-iris-600/8',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {(isTier1 || isTier2) && (
            <span
              className={[
                'text-base',
                isTier1 ? 'text-error' : 'text-gold-400',
              ].join(' ')}
              aria-hidden="true"
            >
              {isTier1 ? '\u26A0' : '\u25CB'}
            </span>
          )}
          <p
            className={[
              'font-sans font-semibold text-sm',
              isTier1
                ? 'text-error'
                : isTier2
                  ? 'text-gold-300'
                  : 'text-iris-200',
            ].join(' ')}
          >
            {isTier1
              ? 'You matter \u2014 crisis support available now'
              : isTier2
                ? 'Support is here for you'
                : 'Checking in with you'}
          </p>
        </div>

        {crisis.tier === 3 && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-text-muted hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-iris-500 rounded text-xs px-1"
            aria-label="Dismiss"
          >
            \u2715
          </button>
        )}
      </div>

      <p
        className={[
          'font-sans text-sm leading-relaxed whitespace-pre-line',
          isTier1
            ? 'text-error/90'
            : isTier2
              ? 'text-gold-200'
              : 'text-text-secondary',
        ].join(' ')}
      >
        {crisis.response}
      </p>

      {(isTier1 || isTier2) && (
        <CrisisResourceCard variant={isTier1 ? 'urgent' : 'supportive'} />
      )}
    </div>
  )
}
