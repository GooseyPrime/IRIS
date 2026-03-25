import { useState } from 'react'
import { GOAL_OPTIONS } from '@/types'

interface StepGoalsProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function StepGoals({ value, onChange }: StepGoalsProps) {
  const [customInput, setCustomInput] = useState('')

  function toggle(goal: string) {
    if (value.includes(goal)) {
      onChange(value.filter((g) => g !== goal))
    } else {
      onChange([...value, goal])
    }
  }

  function addCustom() {
    const trimmed = customInput.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setCustomInput('')
    }
  }

  function removeCustom(goal: string) {
    onChange(value.filter((g) => g !== goal))
  }

  const presetSet = new Set<string>(GOAL_OPTIONS)
  const customGoals = value.filter((g) => !presetSet.has(g))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-sans text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Step 3
        </p>
        <h2 className="font-serif font-semibold text-3xl text-text-primary leading-tight">
          What are your goals?
        </h2>
        <p className="font-sans text-base text-text-secondary mt-2 leading-relaxed">
          Choose what matters most to you right now. IRIS will keep these front and centre.
        </p>
      </div>

      <div className="flex flex-col gap-2" role="group" aria-label="Goal selection">
        {GOAL_OPTIONS.map((goal) => {
          const selected = value.includes(goal)
          return (
            <button
              key={goal}
              type="button"
              onClick={() => toggle(goal)}
              aria-pressed={selected}
              className={[
                'flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left',
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
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
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
              {goal}
            </button>
          )
        })}
      </div>

      {/* Custom goal input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="custom-goal"
          className="font-sans text-xs text-text-muted uppercase tracking-[0.15em]"
        >
          Add your own
        </label>
        <div className="flex gap-2">
          <input
            id="custom-goal"
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
            placeholder="e.g. Run a 5K"
            maxLength={120}
            className="flex-1 bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors duration-200"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="px-4 py-3 rounded-xl bg-iris-600 text-white font-sans text-sm font-medium hover:bg-iris-500 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
          >
            Add
          </button>
        </div>

        {customGoals.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {customGoals.map((goal) => (
              <span
                key={goal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-iris-500/20 border border-iris-500/40 font-sans text-xs text-iris-200"
              >
                {goal}
                <button
                  type="button"
                  onClick={() => removeCustom(goal)}
                  className="text-iris-400 hover:text-text-primary transition-colors focus-visible:outline-none"
                  aria-label={`Remove ${goal}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {value.length === 0 && (
        <p className="font-sans text-xs text-error" role="alert">
          Please select or add at least one goal.
        </p>
      )}
    </div>
  )
}
