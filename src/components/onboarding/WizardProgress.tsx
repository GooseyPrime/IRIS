interface WizardProgressProps {
  currentStep: number
  totalSteps: number
  labels: readonly string[]
}

export function WizardProgress({ currentStep, totalSteps, labels }: WizardProgressProps) {
  return (
    <div className="w-full" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      {/* Step counter */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-xs text-text-muted uppercase tracking-[0.15em]">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="font-sans text-xs text-text-secondary">
          {labels[currentStep - 1]}
        </p>
      </div>

      {/* Progress track */}
      <div className="relative h-1 rounded-full bg-iris-900/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-iris-500 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
        />
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-between mt-3">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1
          const isDone = step < currentStep
          const isCurrent = step === currentStep
          return (
            <div
              key={step}
              className={[
                'w-2 h-2 rounded-full transition-all duration-300',
                isDone
                  ? 'bg-iris-500 scale-100'
                  : isCurrent
                    ? 'bg-iris-400 scale-125 ring-2 ring-iris-500/40'
                    : 'bg-iris-900/60',
              ].join(' ')}
              aria-hidden="true"
            />
          )
        })}
      </div>
    </div>
  )
}
