'use client'

import { useReminders } from '@/hooks/useReminders'
import { Button } from '@/components/ui/Button'

export function ReminderSettings() {
  const { prefs, updatePrefs, permission, requestPermission, mounted } = useReminders()

  if (!mounted) return null

  const needsPermission = permission === 'default'
  const denied = permission === 'denied'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Daily Reminders
        </p>
        <h2 className="font-serif font-light text-2xl text-text-primary mb-2">
          Stay on track
        </h2>
        <p className="font-sans text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
          Get gentle nudges to check in with IRIS each morning and evening.
        </p>
      </div>

      {needsPermission && (
        <div className="bg-surface-1 border border-iris-900/30 rounded-2xl p-4 text-center">
          <p className="font-sans text-sm text-text-secondary mb-3">
            Allow notifications to receive reminders.
          </p>
          <Button size="sm" onClick={requestPermission}>
            Enable notifications
          </Button>
        </div>
      )}

      {denied && (
        <div className="bg-surface-1 border border-error/20 rounded-2xl p-4 text-center">
          <p className="font-sans text-sm text-error/80">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      <div className="space-y-4 max-w-sm mx-auto">
        <ReminderRow
          label="Morning check-in"
          description="Start your day with intention"
          enabled={prefs.morningEnabled}
          time={prefs.morningTime}
          onToggle={(v) => updatePrefs({ morningEnabled: v })}
          onTimeChange={(v) => updatePrefs({ morningTime: v })}
          disabled={denied}
        />

        <ReminderRow
          label="Evening reflection"
          description="Reflect on your day"
          enabled={prefs.eveningEnabled}
          time={prefs.eveningTime}
          onToggle={(v) => updatePrefs({ eveningEnabled: v })}
          onTimeChange={(v) => updatePrefs({ eveningTime: v })}
          disabled={denied}
        />
      </div>

      {(prefs.morningEnabled || prefs.eveningEnabled) && permission === 'granted' && (
        <p className="font-sans text-xs text-text-muted text-center">
          Reminders work while the app is open in your browser.
        </p>
      )}
    </div>
  )
}

function ReminderRow({
  label,
  description,
  enabled,
  time,
  onToggle,
  onTimeChange,
  disabled,
}: {
  label: string
  description: string
  enabled: boolean
  time: string
  onToggle: (value: boolean) => void
  onTimeChange: (value: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-iris-900/30 bg-surface-1">
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium text-text-primary">{label}</p>
        <p className="font-sans text-xs text-text-muted">{description}</p>
      </div>
      <input
        type="time"
        value={time}
        onChange={(e) => onTimeChange(e.target.value)}
        disabled={disabled || !enabled}
        className="bg-surface-2 border border-iris-900/50 rounded-lg px-2 py-1.5 font-sans text-xs text-text-primary focus:outline-none focus:border-iris-500 transition-colors disabled:opacity-40 w-[5.5rem]"
        aria-label={`${label} time`}
      />
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        disabled={disabled}
        className={[
          'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          enabled ? 'bg-iris-600' : 'bg-surface-2',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
            enabled ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
