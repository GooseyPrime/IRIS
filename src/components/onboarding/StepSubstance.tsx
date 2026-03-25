import { SUBSTANCE_OPTIONS } from '@/types'
import type { SubstanceOption } from '@/types'

interface StepSubstanceProps {
  value: SubstanceOption[]
  onChange: (value: SubstanceOption[]) => void
}

const LABELS: Record<SubstanceOption, string> = {
  alcohol: 'Alcohol',
  cannabis: 'Cannabis',
  opioids: 'Opioids',
  stimulants: 'Stimulants',
  benzodiazepines: 'Benzodiazepines',
  tobacco: 'Tobacco / Nicotine',
  other: 'Other',
}

export function StepSubstance({ value, onChange }: StepSubstanceProps) {
  function toggle(substance: SubstanceOption) {
    if (value.includes(substance)) {
      onChange(value.filter((s) => s !== substance))
    } else {
      onChange([...value, substance])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-sans text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Step 1
        </p>
        <h2 className="font-serif font-semibold text-3xl text-text-primary leading-tight">
          What are you recovering from?
        </h2>
        <p className="font-sans text-base text-text-secondary mt-2 leading-relaxed">
          Select all that apply. This helps IRIS personalise your experience — you can update
          it any time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Substance selection">
        {SUBSTANCE_OPTIONS.map((substance) => {
          const selected = value.includes(substance)
          return (
            <button
              key={substance}
              type="button"
              onClick={() => toggle(substance)}
              aria-pressed={selected}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl border text-left',
                'font-sans text-sm font-medium',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                selected
                  ? 'border-iris-500 bg-iris-500/15 text-text-primary'
                  : 'border-iris-900/40 bg-surface-1 text-text-secondary hover:border-iris-600/60 hover:bg-surface-2',
              ].join(' ')}
            >
              <span
                className={[
                  'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                  selected ? 'border-iris-500 bg-iris-500' : 'border-iris-700',
                ].join(' ')}
                aria-hidden="true"
              >
                {selected && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 10 8"
                    fill="none"
                  >
                    <path
                      d="M1 4l2.5 2.5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              {LABELS[substance]}
            </button>
          )
        })}
      </div>

      {value.length === 0 && (
        <p className="font-sans text-xs text-error" role="alert">
          Please select at least one option.
        </p>
      )}
    </div>
  )
}
