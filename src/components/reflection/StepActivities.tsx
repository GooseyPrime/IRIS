'use client'

import { ACTIVITY_OPTIONS } from '@/types'

interface StepActivitiesProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function StepActivities({ value, onChange }: StepActivitiesProps) {
  const toggle = (activity: string) => {
    if (value.includes(activity)) {
      onChange(value.filter((a) => a !== activity))
    } else {
      onChange([...value, activity])
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif font-light text-2xl text-text-primary mb-2">
          What did you do today?
        </h2>
        <p className="font-sans text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
          Select any activities that were part of your day. Skip if none apply.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
        {ACTIVITY_OPTIONS.map((activity) => {
          const selected = value.includes(activity)
          return (
            <button
              key={activity}
              type="button"
              onClick={() => toggle(activity)}
              className={[
                'px-3 py-2.5 rounded-xl border font-sans text-sm transition-all duration-200 text-left',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                selected
                  ? 'border-iris-500/60 bg-iris-500/10 text-iris-300'
                  : 'border-iris-900/30 bg-surface-1 text-text-secondary hover:border-iris-600/50 hover:bg-surface-2',
              ].join(' ')}
            >
              {activity}
            </button>
          )
        })}
      </div>
    </div>
  )
}
