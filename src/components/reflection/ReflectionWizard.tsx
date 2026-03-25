'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StepSobriety } from '@/components/reflection/StepSobriety'
import { StepMood } from '@/components/reflection/StepMood'
import { StepActivities } from '@/components/reflection/StepActivities'
import { StepJournal } from '@/components/reflection/StepJournal'
import { ReflectionSummary } from '@/components/reflection/ReflectionSummary'
import { Button } from '@/components/ui/Button'
import { saveReflection } from '@/app/(app)/reflection/_actions'

interface UserContext {
  name: string
  daysSober: number
  tone: string
}

interface ReflectionWizardProps {
  userContext?: UserContext | undefined
}

const TOTAL_STEPS = 4

export function ReflectionWizard({ userContext }: ReflectionWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [soberToday, setSoberToday] = useState<boolean | null>(null)
  const [mood, setMood] = useState<number | null>(null)
  const [activities, setActivities] = useState<string[]>([])
  const [journal, setJournal] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return soberToday !== null
      case 1:
        return mood !== null
      case 2:
        return true
      case 3:
        return true
      default:
        return false
    }
  })()

  const handleNext = useCallback(async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1)
      return
    }

    setIsSaving(true)
    setSaveError(null)

    const result = await saveReflection({
      soberToday,
      mood,
      activities,
      journal: journal || undefined,
    })

    setIsSaving(false)

    if (!result.success) {
      setSaveError(result.error)
      return
    }

    setShowSummary(true)
  }, [step, soberToday, mood, activities, journal])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }, [step])

  const handleDone = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  if (showSummary && soberToday !== null && mood !== null) {
    return (
      <ReflectionSummary
        soberToday={soberToday}
        mood={mood}
        activities={activities}
        journal={journal}
        userContext={userContext}
        onDone={handleDone}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={[
              'h-1.5 rounded-full transition-all duration-300',
              i === step
                ? 'w-8 bg-iris-500'
                : i < step
                  ? 'w-4 bg-iris-700'
                  : 'w-4 bg-surface-2',
            ].join(' ')}
            role="presentation"
          />
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <StepSobriety value={soberToday} onChange={setSoberToday} />
      )}
      {step === 1 && <StepMood value={mood} onChange={setMood} />}
      {step === 2 && (
        <StepActivities value={activities} onChange={setActivities} />
      )}
      {step === 3 && <StepJournal value={journal} onChange={setJournal} />}

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-md mx-auto">
        {step > 0 ? (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          onClick={handleNext}
          disabled={!canAdvance || isSaving}
          loading={isSaving}
        >
          {step === TOTAL_STEPS - 1 ? 'Finish' : 'Continue'}
        </Button>
      </div>

      {saveError !== null && (
        <p className="font-sans text-xs text-error text-center">{saveError}</p>
      )}
    </div>
  )
}
