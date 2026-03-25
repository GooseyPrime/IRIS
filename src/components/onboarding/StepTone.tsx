import type { TonePreference } from '@/types'

interface StepToneProps {
  value: TonePreference
  onChange: (value: TonePreference) => void
}

interface ToneCard {
  value: TonePreference
  label: string
  description: string
  example: string
}

const TONE_CARDS: ToneCard[] = [
  {
    value: 'warm',
    label: 'Warm & Nurturing',
    description: 'Gentle encouragement, empathy first',
    example: "\"You're doing so well. One day at a time.\"",
  },
  {
    value: 'direct',
    label: 'Direct & Practical',
    description: 'Clear, actionable, no fluff',
    example: "\"Here's what to do right now when a craving hits.\"",
  },
  {
    value: 'spiritual',
    label: 'Spiritual & Reflective',
    description: 'Meaning, growth, higher purpose',
    example: "\"Every challenge is shaping the person you're becoming.\"",
  },
  {
    value: 'clinical',
    label: 'Clinical & Evidence-Based',
    description: 'CBT-grounded, structured, research-backed',
    example: "\"Let's identify the thought pattern behind that urge.\"",
  },
]

export function StepTone({ value, onChange }: StepToneProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-sans text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Step 5
        </p>
        <h2 className="font-serif font-semibold text-3xl text-text-primary leading-tight">
          How should IRIS speak to you?
        </h2>
        <p className="font-sans text-base text-text-secondary mt-2 leading-relaxed">
          Choose the tone that resonates most. You can change this any time in settings.
        </p>
      </div>

      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Tone selection">
        {TONE_CARDS.map((card) => {
          const selected = value === card.value
          return (
            <button
              key={card.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(card.value)}
              className={[
                'flex flex-col gap-1 w-full px-5 py-4 rounded-2xl border text-left',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                selected
                  ? 'border-iris-500 bg-iris-500/10'
                  : 'border-iris-900/40 bg-surface-1 hover:border-iris-600/50 hover:bg-surface-2',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span
                  className={[
                    'font-sans text-sm font-semibold',
                    selected ? 'text-text-primary' : 'text-text-secondary',
                  ].join(' ')}
                >
                  {card.label}
                </span>
                <span
                  className={[
                    'w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors',
                    selected
                      ? 'border-iris-500 bg-iris-500'
                      : 'border-iris-700 bg-transparent',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {selected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </div>
              <p className="font-sans text-xs text-text-muted">{card.description}</p>
              <p
                className={[
                  'font-serif text-sm italic mt-1',
                  selected ? 'text-iris-200' : 'text-text-muted',
                ].join(' ')}
              >
                {card.example}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
