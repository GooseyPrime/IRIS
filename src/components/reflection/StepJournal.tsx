'use client'

import { useCallback } from 'react'

interface StepJournalProps {
  value: string
  onChange: (value: string) => void
}

export function StepJournal({ value, onChange }: StepJournalProps) {
  const remaining = 1000 - value.length

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= 1000) {
        onChange(e.target.value)
      }
    },
    [onChange],
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif font-light text-2xl text-text-primary mb-2">
          Anything on your mind?
        </h2>
        <p className="font-sans text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
          Optional — write whatever feels right. IRIS will reflect it back to you.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Today I felt... I noticed... I'm grateful for..."
          rows={5}
          className="w-full resize-none bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors duration-200"
          aria-label="Journal entry"
        />
        <p
          className={[
            'font-sans text-xs mt-1.5 text-right transition-colors',
            remaining < 100 ? 'text-gold-500' : 'text-text-muted',
          ].join(' ')}
        >
          {remaining} characters remaining
        </p>
      </div>
    </div>
  )
}
