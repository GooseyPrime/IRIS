'use client'

import { MOOD_LABELS } from '@/types'

interface StepMoodProps {
  value: number | null
  onChange: (value: number) => void
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '\u{1F61E}',
  2: '\u{1F614}',
  3: '\u{1F610}',
  4: '\u{1F60A}',
  5: '\u{1F31F}',
}

export function StepMood({ value, onChange }: StepMoodProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif font-light text-2xl text-text-primary mb-2">
          How are you feeling tonight?
        </h2>
        <p className="font-sans text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
          There are no wrong answers.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {([1, 2, 3, 4, 5] as const).map((level) => {
          const selected = value === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              aria-label={`${MOOD_LABELS[level]} — ${level} of 5`}
              className={[
                'flex flex-col items-center gap-1.5 w-16 py-3 rounded-xl border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                selected
                  ? 'border-iris-500/60 bg-iris-500/10 text-text-primary scale-110'
                  : 'border-iris-900/30 bg-surface-1 text-text-secondary hover:border-iris-600/50 hover:bg-surface-2',
              ].join(' ')}
            >
              <span className="text-2xl" aria-hidden="true">
                {MOOD_EMOJIS[level]}
              </span>
              <span className="font-sans text-[0.65rem] font-medium leading-tight">
                {MOOD_LABELS[level]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
