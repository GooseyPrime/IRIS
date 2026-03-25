import { useState } from 'react'

interface EmotionGroup {
  label: string
  emotions: string[]
}

const EMOTION_GROUPS: EmotionGroup[] = [
  {
    label: 'Positive',
    emotions: ['Grateful', 'Hopeful', 'Proud', 'Calm', 'Motivated', 'Connected'],
  },
  {
    label: 'Neutral',
    emotions: ['Tired', 'Distracted', 'Numb', 'Restless'],
  },
  {
    label: 'Challenging',
    emotions: ['Anxious', 'Stressed', 'Lonely', 'Irritable', 'Sad', 'Overwhelmed'],
  },
  {
    label: 'Recovery',
    emotions: ['Craving', 'Tempted', 'Triggered', 'Vulnerable'],
  },
]

interface EmotionTagsProps {
  value: string[]
  onChange: (value: string[]) => void
  readOnly?: boolean
}

export function EmotionTags({ value, onChange, readOnly = false }: EmotionTagsProps) {
  const [customInput, setCustomInput] = useState('')

  function toggle(emotion: string) {
    if (readOnly) return
    if (value.includes(emotion)) {
      onChange(value.filter((e) => e !== emotion))
    } else if (value.length < 10) {
      onChange([...value, emotion])
    }
  }

  function addCustom() {
    const trimmed = customInput.trim()
    if (trimmed && !value.includes(trimmed) && value.length < 10) {
      onChange([...value, trimmed])
      setCustomInput('')
    }
  }

  const presetSet = new Set(EMOTION_GROUPS.flatMap((g) => g.emotions))
  const customEmotions = value.filter((e) => !presetSet.has(e))

  return (
    <div className="flex flex-col gap-4">
      <label className="font-sans text-sm font-medium text-text-secondary">
        Emotions{' '}
        <span className="text-text-muted font-normal">
          — select up to 10 (optional)
        </span>
      </label>

      <div className="flex flex-col gap-3">
        {EMOTION_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1.5">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-text-muted">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.emotions.map((emotion) => {
                const selected = value.includes(emotion)
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggle(emotion)}
                    aria-pressed={selected}
                    disabled={readOnly || (!selected && value.length >= 10)}
                    className={[
                      'px-3 py-1.5 rounded-full border font-sans text-xs font-medium',
                      'transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0',
                      selected
                        ? 'border-iris-500 bg-iris-500/20 text-iris-200'
                        : 'border-iris-900/40 bg-surface-2 text-text-muted hover:border-iris-700/60',
                      readOnly || (!selected && value.length >= 10)
                        ? 'cursor-default opacity-50'
                        : 'cursor-pointer',
                    ].join(' ')}
                  >
                    {emotion}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom emotion input — only when not readOnly */}
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustom()
              }
            }}
            placeholder="Add your own…"
            maxLength={40}
            disabled={value.length >= 10}
            className="flex-1 bg-surface-2 border border-iris-900/50 rounded-xl px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors disabled:opacity-40"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim() || value.length >= 10}
            className="px-4 py-2 rounded-xl bg-iris-600 text-white font-sans text-sm font-medium hover:bg-iris-500 transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0"
          >
            Add
          </button>
        </div>
      )}

      {/* Custom tags display */}
      {customEmotions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customEmotions.map((emotion) => (
            <span
              key={emotion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 font-sans text-xs text-gold-300"
            >
              {emotion}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => toggle(emotion)}
                  className="text-gold-400 hover:text-text-primary transition-colors focus-visible:outline-none"
                  aria-label={`Remove ${emotion}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
