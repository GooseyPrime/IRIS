interface MoodOption {
  value: number
  label: string
  emoji: string
  selectedBg: string
  selectedBorder: string
  selectedText: string
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 1,
    label: 'Struggling',
    emoji: '😔',
    selectedBg: 'bg-error/15',
    selectedBorder: 'border-error/60',
    selectedText: 'text-error',
  },
  {
    value: 2,
    label: 'Difficult',
    emoji: '😟',
    selectedBg: 'bg-gold-900/30',
    selectedBorder: 'border-gold-600/60',
    selectedText: 'text-gold-400',
  },
  {
    value: 3,
    label: 'Okay',
    emoji: '😐',
    selectedBg: 'bg-iris-900/40',
    selectedBorder: 'border-iris-500/60',
    selectedText: 'text-iris-300',
  },
  {
    value: 4,
    label: 'Good',
    emoji: '🙂',
    selectedBg: 'bg-iris-800/30',
    selectedBorder: 'border-iris-400/60',
    selectedText: 'text-iris-200',
  },
  {
    value: 5,
    label: 'Great',
    emoji: '😊',
    selectedBg: 'bg-success/10',
    selectedBorder: 'border-success/50',
    selectedText: 'text-success',
  },
]

interface MoodSelectorProps {
  value: number | null
  onChange: (value: number) => void
  readOnly?: boolean
}

export function MoodSelector({ value, onChange, readOnly = false }: MoodSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="font-sans text-sm font-medium text-text-secondary">
        How are you feeling right now?
      </label>
      <div
        className="flex gap-2"
        role={readOnly ? undefined : 'radiogroup'}
        aria-label="Mood selection"
      >
        {MOOD_OPTIONS.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role={readOnly ? undefined : 'radio'}
              aria-checked={readOnly ? undefined : selected}
              aria-label={opt.label}
              disabled={readOnly}
              onClick={() => !readOnly && onChange(opt.value)}
              className={[
                'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                selected
                  ? `${opt.selectedBg} ${opt.selectedBorder} ${opt.selectedText}`
                  : 'border-iris-900/40 bg-surface-2 text-text-muted hover:border-iris-700/50 hover:bg-surface-2',
                readOnly ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {opt.emoji}
              </span>
              <span className="font-sans text-[0.6rem] uppercase tracking-[0.12em]">
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
