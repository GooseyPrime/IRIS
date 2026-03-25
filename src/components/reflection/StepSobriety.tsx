'use client'

interface StepSobrietyProps {
  value: boolean | null
  onChange: (value: boolean) => void
}

export function StepSobriety({ value, onChange }: StepSobrietyProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Evening Reflection
        </p>
        <h2 className="font-serif font-light text-2xl text-text-primary mb-2">
          Did you stay sober today?
        </h2>
        <p className="font-sans text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
          No matter the answer, your honesty here is what matters most.
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={[
            'flex flex-col items-center gap-2 px-8 py-6 rounded-2xl border transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
            value === true
              ? 'border-success/60 bg-success/10 text-success'
              : 'border-iris-900/30 bg-surface-1 text-text-secondary hover:border-iris-600/50 hover:bg-surface-2',
          ].join(' ')}
        >
          <span className="text-3xl" aria-hidden="true">
            &#10003;
          </span>
          <span className="font-sans text-sm font-medium">Yes</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={[
            'flex flex-col items-center gap-2 px-8 py-6 rounded-2xl border transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
            value === false
              ? 'border-iris-400/60 bg-iris-400/10 text-iris-300'
              : 'border-iris-900/30 bg-surface-1 text-text-secondary hover:border-iris-600/50 hover:bg-surface-2',
          ].join(' ')}
        >
          <span className="text-3xl" aria-hidden="true">
            &#10007;
          </span>
          <span className="font-sans text-sm font-medium">No</span>
        </button>
      </div>

      {value === false && (
        <p className="font-sans text-xs text-text-secondary text-center max-w-xs mx-auto leading-relaxed animate-fade-up">
          That takes courage to share. Recovery is not a straight line, and
          showing up here tonight still counts.
        </p>
      )}
    </div>
  )
}
