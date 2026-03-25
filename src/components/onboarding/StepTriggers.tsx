import { useState } from 'react'
import { TRIGGER_OPTIONS } from '@/types'

interface StepTriggersProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function StepTriggers({ value, onChange }: StepTriggersProps) {
  const [customInput, setCustomInput] = useState('')

  function toggle(trigger: string) {
    if (value.includes(trigger)) {
      onChange(value.filter((t) => t !== trigger))
    } else {
      onChange([...value, trigger])
    }
  }

  function addCustom() {
    const trimmed = customInput.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setCustomInput('')
    }
  }

  function removeCustom(trigger: string) {
    onChange(value.filter((t) => t !== trigger))
  }

  const presetSet = new Set<string>(TRIGGER_OPTIONS)
  const customTriggers = value.filter((t) => !presetSet.has(t))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-sans text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Step 4
        </p>
        <h2 className="font-serif font-semibold text-3xl text-text-primary leading-tight">
          What tends to trigger you?
        </h2>
        <p className="font-sans text-base text-text-secondary mt-2 leading-relaxed">
          Knowing your triggers helps IRIS support you in difficult moments. You can always
          update this later.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Trigger selection">
        {TRIGGER_OPTIONS.map((trigger) => {
          const selected = value.includes(trigger)
          return (
            <button
              key={trigger}
              type="button"
              onClick={() => toggle(trigger)}
              aria-pressed={selected}
              className={[
                'inline-flex items-center px-4 py-2 rounded-full border',
                'font-sans text-sm font-medium',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                selected
                  ? 'border-iris-500 bg-iris-500/15 text-text-primary'
                  : 'border-iris-900/40 bg-surface-1 text-text-secondary hover:border-iris-600/60 hover:bg-surface-2',
              ].join(' ')}
            >
              {trigger}
            </button>
          )
        })}
      </div>

      {/* Custom trigger input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="custom-trigger"
          className="font-sans text-xs text-text-muted uppercase tracking-[0.15em]"
        >
          Add your own
        </label>
        <div className="flex gap-2">
          <input
            id="custom-trigger"
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
            placeholder="e.g. Late nights alone"
            maxLength={80}
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

        {customTriggers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {customTriggers.map((trigger) => (
              <span
                key={trigger}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-iris-500/20 border border-iris-500/40 font-sans text-xs text-iris-200"
              >
                {trigger}
                <button
                  type="button"
                  onClick={() => removeCustom(trigger)}
                  className="text-iris-400 hover:text-text-primary transition-colors focus-visible:outline-none"
                  aria-label={`Remove ${trigger}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="font-sans text-xs text-text-muted">
        Triggers are optional but help IRIS be more proactive in supporting you.
      </p>
    </div>
  )
}
