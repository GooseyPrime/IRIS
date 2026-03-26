'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/(app)/settings/_actions'
import { SUBSTANCE_OPTIONS, GOAL_OPTIONS, TRIGGER_OPTIONS } from '@/types'
import type { TonePreference } from '@/types'

interface SettingsFormProps {
  initialDisplayName: string
  initialSobrietyDate: string
  initialSubstances: string[]
  initialGoals: string[]
  initialTriggers: string[]
  initialTonePreference: string
}

const TONE_OPTIONS: { value: TonePreference; label: string }[] = [
  { value: 'warm', label: 'Warm & Nurturing' },
  { value: 'direct', label: 'Direct & Practical' },
  { value: 'spiritual', label: 'Spiritual & Reflective' },
  { value: 'clinical', label: 'Clinical & Evidence-Based' },
]

export function SettingsForm({
  initialDisplayName,
  initialSobrietyDate,
  initialSubstances,
  initialGoals,
  initialTriggers,
  initialTonePreference,
}: SettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [sobrietyDate, setSobrietyDate] = useState(initialSobrietyDate)
  const [substances, setSubstances] = useState<string[]>(initialSubstances)
  const [goals, setGoals] = useState<string[]>(initialGoals)
  const [triggers, setTriggers] = useState<string[]>(initialTriggers)
  const [tonePreference, setTonePreference] = useState(initialTonePreference)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item))
    } else {
      setter([...list, item])
    }
  }

  function handleSave() {
    setMessage(null)
    startTransition(async () => {
      const result = await updateProfile({
        displayName,
        sobrietyDate,
        substances,
        goals,
        triggers,
        tonePreference,
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved.' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Display Name */}
      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="font-sans text-sm text-text-secondary">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How should IRIS greet you?"
          maxLength={100}
          className="bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors"
        />
      </fieldset>

      {/* Sobriety Date */}
      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="sobrietyDate" className="font-sans text-sm text-text-secondary">
          Sobriety Date
        </label>
        <input
          id="sobrietyDate"
          type="date"
          value={sobrietyDate}
          onChange={(e) => setSobrietyDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary focus:outline-none focus:border-iris-500 transition-colors [color-scheme:dark]"
        />
      </fieldset>

      {/* Substances */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-sans text-sm text-text-secondary mb-1">Substances</legend>
        <div className="flex flex-wrap gap-2">
          {SUBSTANCE_OPTIONS.map((sub) => {
            const selected = substances.includes(sub)
            return (
              <button
                key={sub}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleItem(substances, sub, setSubstances)}
                className={[
                  'px-4 py-2 rounded-full border font-sans text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                  selected
                    ? 'border-iris-500 bg-iris-500/15 text-text-primary'
                    : 'border-iris-900/40 bg-surface-1 text-text-secondary hover:border-iris-600/60 hover:bg-surface-2',
                ].join(' ')}
              >
                {sub}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Goals */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-sans text-sm text-text-secondary mb-1">Goals</legend>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => {
            const selected = goals.includes(goal)
            return (
              <button
                key={goal}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleItem(goals, goal, setGoals)}
                className={[
                  'px-4 py-2 rounded-full border font-sans text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                  selected
                    ? 'border-iris-500 bg-iris-500/15 text-text-primary'
                    : 'border-iris-900/40 bg-surface-1 text-text-secondary hover:border-iris-600/60 hover:bg-surface-2',
                ].join(' ')}
              >
                {goal}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Triggers */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-sans text-sm text-text-secondary mb-1">Triggers</legend>
        <div className="flex flex-wrap gap-2">
          {TRIGGER_OPTIONS.map((trigger) => {
            const selected = triggers.includes(trigger)
            return (
              <button
                key={trigger}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleItem(triggers, trigger, setTriggers)}
                className={[
                  'px-4 py-2 rounded-full border font-sans text-sm font-medium transition-all duration-200',
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
      </fieldset>

      {/* Tone Preference */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-sans text-sm text-text-secondary mb-1">Tone Preference</legend>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Tone preference">
          {TONE_OPTIONS.map((opt) => {
            const selected = tonePreference === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTonePreference(opt.value)}
                className={[
                  'flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                  selected
                    ? 'border-iris-500 bg-iris-500/10'
                    : 'border-iris-900/40 bg-surface-1 hover:border-iris-600/50 hover:bg-surface-2',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors',
                    selected ? 'border-iris-500 bg-iris-500' : 'border-iris-700 bg-transparent',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className={['font-sans text-sm', selected ? 'text-text-primary' : 'text-text-secondary'].join(' ')}>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Save */}
      {message && (
        <p
          className={[
            'font-sans text-sm text-center',
            message.type === 'success' ? 'text-green-400' : 'text-error',
          ].join(' ')}
          role="alert"
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={handleSave}
        className="w-full px-6 py-3 rounded-xl bg-iris-600 text-white font-sans text-sm font-medium hover:bg-iris-500 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
      >
        {isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
