interface StepSobrietyDateProps {
  value: string
  unknown: boolean
  onDateChange: (value: string) => void
  onUnknownChange: (value: boolean) => void
}

export function StepSobrietyDate({
  value,
  unknown,
  onDateChange,
  onUnknownChange,
}: StepSobrietyDateProps) {
  const today = new Date().toISOString().split('T')[0] ?? ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-sans text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Step 2
        </p>
        <h2 className="font-serif font-semibold text-3xl text-text-primary leading-tight">
          When did your journey begin?
        </h2>
        <p className="font-sans text-base text-text-secondary mt-2 leading-relaxed">
          Your sobriety date lets IRIS track how far you&apos;ve come. Every day is a
          milestone.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="sobriety-date"
            className="block font-sans text-sm font-medium text-text-secondary mb-2"
          >
            Sobriety date
          </label>
          <input
            id="sobriety-date"
            type="date"
            value={unknown ? '' : value}
            max={today}
            disabled={unknown}
            onChange={(e) => onDateChange(e.target.value)}
            className={[
              'w-full bg-surface-2 border rounded-xl px-4 py-3',
              'font-sans text-base text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:border-iris-500 transition-colors duration-200',
              unknown
                ? 'border-iris-900/20 opacity-40 cursor-not-allowed'
                : 'border-iris-900/50',
            ].join(' ')}
          />
        </div>

        <button
          type="button"
          onClick={() => onUnknownChange(!unknown)}
          className={[
            'flex items-center gap-3 w-full px-4 py-3 rounded-xl border',
            'font-sans text-sm font-medium text-left',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
            unknown
              ? 'border-iris-500 bg-iris-500/15 text-text-primary'
              : 'border-iris-900/40 bg-surface-1 text-text-secondary hover:border-iris-600/60 hover:bg-surface-2',
          ].join(' ')}
          aria-pressed={unknown}
        >
          <span
            className={[
              'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
              unknown ? 'border-iris-500 bg-iris-500' : 'border-iris-700',
            ].join(' ')}
            aria-hidden="true"
          >
            {unknown && (
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
          I&apos;m not sure of my exact date — that&apos;s okay
        </button>

        {!unknown && !value && (
          <p className="font-sans text-xs text-text-muted">
            You can skip this for now and update it later in settings.
          </p>
        )}
      </div>
    </div>
  )
}
