'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { completeOnboarding } from '@/app/(auth)/onboarding/_actions'
import { WizardProgress } from './WizardProgress'
import { StepSubstance } from './StepSubstance'
import { StepSobrietyDate } from './StepSobrietyDate'
import { StepGoals } from './StepGoals'
import { StepTriggers } from './StepTriggers'
import { StepTone } from './StepTone'
import { Button } from '@/components/ui/Button'
import type { SubstanceOption, TonePreference } from '@/types'

interface WizardState {
  substances: SubstanceOption[]
  sobrietyDate: string
  sobrietyDateUnknown: boolean
  goals: string[]
  triggers: string[]
  tonePreference: TonePreference
}

const STEP_LABELS = [
  'Substance',
  'Sobriety Date',
  'Goals',
  'Triggers',
  'Tone',
] as const

const TOTAL_STEPS = STEP_LABELS.length

function canAdvance(step: number, state: WizardState): boolean {
  switch (step) {
    case 1:
      return state.substances.length > 0
    case 2:
      return state.sobrietyDateUnknown || state.sobrietyDate.length > 0
    case 3:
      return state.goals.length > 0
    case 4:
      return true
    case 5:
      return true
    default:
      return false
  }
}

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [authInitialised, setAuthInitialised] = useState(false)
  const authAttempted = useRef(false)

  const [state, setState] = useState<WizardState>({
    substances: [],
    sobrietyDate: '',
    sobrietyDateUnknown: false,
    goals: [],
    triggers: [],
    tonePreference: 'warm',
  })

  // Start an anonymous Supabase session on mount if none exists
  useEffect(() => {
    if (authAttempted.current) return
    authAttempted.current = true

    async function initAnonymousAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error('[OnboardingWizard] anonymous auth error:', error)
        }
      }
      setAuthInitialised(true)
    }

    void initAnonymousAuth()
  }, [])

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1)
  }, [step])

  const handleFinish = useCallback(async () => {
    setSubmitting(true)
    setServerError(null)

    const payload = {
      substances: state.substances,
      sobrietyDate: state.sobrietyDate || undefined,
      sobrietyDateUnknown: state.sobrietyDateUnknown,
      goals: state.goals,
      triggers: state.triggers,
      tonePreference: state.tonePreference,
    }

    const result = await completeOnboarding(payload)

    // completeOnboarding calls redirect() on success, so we only reach here on error
    if (!result.success) {
      setServerError(result.error)
      setSubmitting(false)
    }
  }, [state])

  const canGoNext = canAdvance(step, state)

  return (
    <div className="flex flex-col gap-8">
      {/* IRIS wordmark */}
      <div className="text-center">
        <p className="font-serif font-light text-4xl tracking-tight text-zinc-100">
          IRIS
        </p>
        <p className="font-sans text-xs text-zinc-400 mt-1 uppercase tracking-[0.2em]">
          I Rise, I Shine
        </p>
      </div>

      {/* Card */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
        {/* Progress */}
        <WizardProgress
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          labels={STEP_LABELS}
        />

        {/* Step content */}
        <div className="mt-8 min-h-[360px]">
          {step === 1 && (
            <StepSubstance
              value={state.substances}
              onChange={(substances) => setState((s) => ({ ...s, substances }))}
            />
          )}
          {step === 2 && (
            <StepSobrietyDate
              value={state.sobrietyDate}
              unknown={state.sobrietyDateUnknown}
              onDateChange={(sobrietyDate) => setState((s) => ({ ...s, sobrietyDate }))}
              onUnknownChange={(sobrietyDateUnknown) =>
                setState((s) => ({ ...s, sobrietyDateUnknown }))
              }
            />
          )}
          {step === 3 && (
            <StepGoals
              value={state.goals}
              onChange={(goals) => setState((s) => ({ ...s, goals }))}
            />
          )}
          {step === 4 && (
            <StepTriggers
              value={state.triggers}
              onChange={(triggers) => setState((s) => ({ ...s, triggers }))}
            />
          )}
          {step === 5 && (
            <StepTone
              value={state.tonePreference}
              onChange={(tonePreference) => setState((s) => ({ ...s, tonePreference }))}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className={step === 1 ? 'invisible' : ''}
          >
            ← Back
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canGoNext || !authInitialised}
            >
              Continue →
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => void handleFinish()}
              loading={submitting}
              disabled={!authInitialised}
            >
              {submitting ? 'Saving…' : 'Begin my journey'}
            </Button>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <p className="mt-4 font-sans text-sm text-error text-center" role="alert">
            {serverError}
          </p>
        )}
      </div>

      {/* Already have an account */}
      <p className="font-sans text-center text-sm text-zinc-400">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-iris-400 hover:text-iris-300 transition-colors underline underline-offset-2"
        >
          Sign in
        </a>
      </p>
    </div>
  )
}
