interface SobrietyPledgeProps {
  value: boolean
  onChange: (value: boolean) => void
  readOnly?: boolean
}

export function SobrietyPledge({ value, onChange, readOnly = false }: SobrietyPledgeProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="font-sans text-sm font-medium text-text-secondary">
        Did you stay sober today?
      </label>

      <div
        className="grid grid-cols-2 gap-3"
        role={readOnly ? undefined : 'radiogroup'}
        aria-label="Sobriety pledge"
      >
        {/* YES */}
        <button
          type="button"
          role={readOnly ? undefined : 'radio'}
          aria-checked={readOnly ? undefined : value}
          disabled={readOnly}
          onClick={() => !readOnly && onChange(true)}
          className={[
            'flex flex-col items-center gap-2 py-4 rounded-xl border',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
            value
              ? 'border-success/60 bg-success/10'
              : 'border-iris-900/40 bg-surface-2 hover:border-iris-700/50',
            readOnly ? 'cursor-default' : 'cursor-pointer',
          ].join(' ')}
        >
          <span className="text-2xl" aria-hidden="true">
            ✓
          </span>
          <div className="text-center">
            <p
              className={[
                'font-sans font-semibold text-sm',
                value ? 'text-success' : 'text-text-muted',
              ].join(' ')}
            >
              Yes
            </p>
            <p className="font-sans text-[0.65rem] text-text-muted mt-0.5">
              I stayed sober
            </p>
          </div>
        </button>

        {/* NO */}
        <button
          type="button"
          role={readOnly ? undefined : 'radio'}
          aria-checked={readOnly ? undefined : !value}
          disabled={readOnly}
          onClick={() => !readOnly && onChange(false)}
          className={[
            'flex flex-col items-center gap-2 py-4 rounded-xl border',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
            !value
              ? 'border-gold-500/60 bg-gold-500/10'
              : 'border-iris-900/40 bg-surface-2 hover:border-iris-700/50',
            readOnly ? 'cursor-default' : 'cursor-pointer',
          ].join(' ')}
        >
          <span className="text-2xl" aria-hidden="true">
            ◇
          </span>
          <div className="text-center">
            <p
              className={[
                'font-sans font-semibold text-sm',
                !value ? 'text-gold-400' : 'text-text-muted',
              ].join(' ')}
            >
              No
            </p>
            <p className="font-sans text-[0.65rem] text-text-muted mt-0.5">
              I need support
            </p>
          </div>
        </button>
      </div>

      {/* Compassionate copy when they select No */}
      {!value && (
        <p className="font-sans text-xs text-text-secondary leading-relaxed mt-1">
          That takes courage to acknowledge. IRIS is here for you — this check-in still counts.
        </p>
      )}
    </div>
  )
}
