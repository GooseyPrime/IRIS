'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { completeOnboarding, skipOnboarding } from '@/app/(auth)/onboarding/_actions'
import type { SubstanceOption, TonePreference } from '@/types'
import { SUBSTANCE_OPTIONS, TRIGGER_OPTIONS, GOAL_OPTIONS } from '@/types'

const MAX_QUESTIONS = 10

interface QuestionData {
  question: string
  type: 'text' | 'select' | 'multiselect'
  options?: string[] | null
  field?: string | null
}

interface HistoryEntry {
  question: string
  answer: string
}

// Extracted onboarding data from conversation
interface ExtractedData {
  substances: SubstanceOption[]
  sobrietyDate: string
  sobrietyDateUnknown: boolean
  goals: string[]
  triggers: string[]
  tonePreference: TonePreference
}

function inferField(answer: string, field: string | null | undefined, data: ExtractedData): ExtractedData {
  const updated = { ...data }

  if (field === 'substances') {
    const lowerAnswer = answer.toLowerCase()
    const matched = SUBSTANCE_OPTIONS.filter((s) => lowerAnswer.includes(s))
    if (matched.length > 0) {
      updated.substances = [...new Set([...updated.substances, ...matched])]
    } else if (updated.substances.length === 0) {
      // Default to 'other' if no match
      updated.substances = ['other']
    }
  }

  if (field === 'sobrietyDate') {
    const dateMatch = answer.match(/\d{4}-\d{2}-\d{2}/)
    if (dateMatch) {
      updated.sobrietyDate = dateMatch[0]
    } else {
      const lowerAnswer = answer.toLowerCase()
      if (
        lowerAnswer.includes("don't know") ||
        lowerAnswer.includes('not sure') ||
        lowerAnswer.includes("don't remember") ||
        lowerAnswer.includes('unsure')
      ) {
        updated.sobrietyDateUnknown = true
      }
    }
  }

  if (field === 'goals') {
    const lowerAnswer = answer.toLowerCase()
    const matched = GOAL_OPTIONS.filter((g) => lowerAnswer.includes(g.toLowerCase()))
    if (matched.length > 0) {
      updated.goals = [...new Set([...updated.goals, ...matched])]
    } else if (answer.trim().length > 0) {
      updated.goals = [...new Set([...updated.goals, answer.trim()])]
    }
  }

  if (field === 'triggers') {
    const lowerAnswer = answer.toLowerCase()
    const matched = TRIGGER_OPTIONS.filter((t) => lowerAnswer.includes(t.toLowerCase()))
    if (matched.length > 0) {
      updated.triggers = [...new Set([...updated.triggers, ...matched])]
    } else if (answer.trim().length > 0) {
      updated.triggers = [...new Set([...updated.triggers, answer.trim()])]
    }
  }

  if (field === 'tonePreference') {
    const lowerAnswer = answer.toLowerCase()
    if (lowerAnswer.includes('warm') || lowerAnswer.includes('gentle') || lowerAnswer.includes('kind')) {
      updated.tonePreference = 'warm'
    } else if (lowerAnswer.includes('direct') || lowerAnswer.includes('practical') || lowerAnswer.includes('straight')) {
      updated.tonePreference = 'direct'
    } else if (lowerAnswer.includes('spiritual') || lowerAnswer.includes('meaning') || lowerAnswer.includes('faith')) {
      updated.tonePreference = 'spiritual'
    } else if (lowerAnswer.includes('clinical') || lowerAnswer.includes('evidence') || lowerAnswer.includes('science')) {
      updated.tonePreference = 'clinical'
    }
  }

  return updated
}

export function CinematicOnboarding() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
  const [answer, setAnswer] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [phase, setPhase] = useState<'loading' | 'question' | 'transitioning' | 'saving' | 'skipping' | 'error'>('loading')
  const [serverError, setServerError] = useState<string | null>(null)
  const [authInitialised, setAuthInitialised] = useState(false)
  const authAttempted = useRef(false)

  const [skipping, setSkipping] = useState(false)

  const [extractedData, setExtractedData] = useState<ExtractedData>({
    substances: [],
    sobrietyDate: '',
    sobrietyDateUnknown: false,
    goals: [],
    triggers: [],
    tonePreference: 'warm',
  })

  // Anonymous auth on mount
  useEffect(() => {
    if (authAttempted.current) return
    authAttempted.current = true

    async function initAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error('[CinematicOnboarding] anonymous auth error:', error)
        }
      }
      setAuthInitialised(true)
    }

    void initAuth()
  }, [])

  // Fetch first question after auth
  useEffect(() => {
    if (!authInitialised) return
    void fetchNextQuestion([], 0)
  }, [authInitialised])

  async function fetchNextQuestion(currentHistory: HistoryEntry[], index: number) {
    setPhase('loading')

    try {
      const res = await fetch('/api/onboarding/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: currentHistory, questionIndex: index }),
      })

      if (!res.ok) {
        throw new Error('Failed to fetch question')
      }

      const data = await res.json() as QuestionData

      setCurrentQuestion(data)
      setAnswer('')
      setSelectedOptions([])

      // Fade in
      setTimeout(() => setPhase('question'), 100)
    } catch {
      setServerError('Having trouble connecting. Please try again.')
      setPhase('error')
    }
  }

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion) return

    const finalAnswer =
      currentQuestion.type === 'multiselect'
        ? selectedOptions.join(', ')
        : currentQuestion.type === 'select'
          ? selectedOptions[0] ?? answer
          : answer

    if (!finalAnswer.trim()) return

    // Update extracted data
    const updatedData = inferField(finalAnswer, currentQuestion.field, extractedData)
    setExtractedData(updatedData)

    const newHistory = [...history, { question: currentQuestion.question, answer: finalAnswer }]
    setHistory(newHistory)

    const nextIndex = questionIndex + 1

    // Transition out
    setPhase('transitioning')

    if (nextIndex >= MAX_QUESTIONS) {
      // Onboarding complete — save
      await new Promise((resolve) => setTimeout(resolve, 600))
      await finishOnboarding(updatedData)
    } else {
      // Small delay for cinematic transition
      await new Promise((resolve) => setTimeout(resolve, 800))
      setQuestionIndex(nextIndex)
      await fetchNextQuestion(newHistory, nextIndex)
    }
  }, [currentQuestion, answer, selectedOptions, history, questionIndex, extractedData])

  async function finishOnboarding(data: ExtractedData) {
    setPhase('saving')
    setServerError(null)

    // Ensure minimum required data
    const payload = {
      substances: data.substances.length > 0 ? data.substances : (['other'] as SubstanceOption[]),
      sobrietyDate: data.sobrietyDate || undefined,
      sobrietyDateUnknown: data.sobrietyDateUnknown || !data.sobrietyDate,
      goals: data.goals.length > 0 ? data.goals : ['Stay sober one day at a time'],
      triggers: data.triggers,
      tonePreference: data.tonePreference,
    }

    const result = await completeOnboarding(payload)

    // completeOnboarding redirects on success — only reach here on error
    if (!result.success) {
      setServerError(result.error)
      setPhase('error')
    }
  }

  async function handleSkip() {
    setPhase('skipping')
    setServerError(null)

    const result = await skipOnboarding()

    // skipOnboarding redirects on success — only reach here on error
    if (!result.success) {
      setServerError(result.error)
      setPhase('error')
    }
  }

  function toggleOption(option: string) {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    )
  }

  function selectSingleOption(option: string) {
    setSelectedOptions([option])
  }

  const opacityClass =
    phase === 'question' ? 'opacity-100' : phase === 'transitioning' ? 'opacity-0' : 'opacity-0'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Progress dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {Array.from({ length: MAX_QUESTIONS }, (_, i) => (
          <span
            key={i}
            className={[
              'w-2 h-2 rounded-full transition-all duration-500',
              i < questionIndex
                ? 'bg-gold-500'
                : i === questionIndex
                  ? 'bg-gold-400 scale-125'
                  : 'bg-white/10',
            ].join(' ')}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Loading state */}
      {phase === 'loading' && (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <span
            className="w-6 h-6 rounded-full border-2 border-iris-400 border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <p className="font-sans text-sm text-text-muted">
            {questionIndex === 0 ? 'Preparing your conversation…' : 'Thinking…'}
          </p>
        </div>
      )}

      {/* Skipping state */}
      {phase === 'skipping' && (
        <div className="flex flex-col items-center gap-4">
          <span
            className="w-6 h-6 rounded-full border-2 border-gold-400 border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <p className="font-serif text-xl text-text-primary">Setting up your account…</p>
        </div>
      )}

      {/* Saving state */}
      {phase === 'saving' && (
        <div className="flex flex-col items-center gap-4">
          <span
            className="w-6 h-6 rounded-full border-2 border-gold-400 border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <p className="font-serif text-xl text-text-primary">Setting up your journey…</p>
        </div>
      )}

      {/* Error state */}
      {phase === 'error' && (
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <p className="font-sans text-sm text-error" role="alert">{serverError}</p>
          <button
            onClick={() => void fetchNextQuestion(history, questionIndex)}
            className="px-6 py-3 rounded-xl bg-iris-600 text-white font-sans text-sm font-medium hover:bg-iris-500 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Question */}
      {(phase === 'question' || phase === 'transitioning') && currentQuestion && (
        <div
          className={[
            'flex flex-col items-center gap-8 max-w-lg w-full text-center transition-all duration-700 ease-in-out',
            opacityClass,
            phase === 'transitioning' ? 'translate-y-4' : 'translate-y-0',
          ].join(' ')}
        >
          {/* Question text */}
          <h2 className="font-serif font-light text-2xl sm:text-3xl text-text-primary leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Answer area */}
          {currentQuestion.type === 'text' && (
            <div className="w-full">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSubmitAnswer()
                  }
                }}
                rows={3}
                autoFocus
                placeholder="Type your response…"
                className="w-full bg-transparent border-b border-iris-700/50 pb-3 font-sans text-lg text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-iris-500 transition-colors resize-none text-center"
              />
            </div>
          )}

          {currentQuestion.type === 'select' && currentQuestion.options && (
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {currentQuestion.options.map((option) => {
                const selected = selectedOptions.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectSingleOption(option)}
                    className={[
                      'px-5 py-3 rounded-2xl border font-sans text-sm transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500',
                      selected
                        ? 'border-iris-500 bg-iris-500/15 text-text-primary'
                        : 'border-white/10 bg-white/5 text-text-secondary hover:border-iris-600/50 hover:bg-white/10',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}

          {currentQuestion.type === 'multiselect' && currentQuestion.options && (
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {currentQuestion.options.map((option) => {
                const selected = selectedOptions.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={[
                      'px-5 py-3 rounded-2xl border font-sans text-sm transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500',
                      selected
                        ? 'border-iris-500 bg-iris-500/15 text-text-primary'
                        : 'border-white/10 bg-white/5 text-text-secondary hover:border-iris-600/50 hover:bg-white/10',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={() => void handleSubmitAnswer()}
            disabled={
              (currentQuestion.type === 'text' && !answer.trim()) ||
              ((currentQuestion.type === 'select' || currentQuestion.type === 'multiselect') &&
                selectedOptions.length === 0)
            }
            className="px-8 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-sans text-sm font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500"
          >
            Continue
          </button>
        </div>
      )}

      {/* Sign-in & skip links */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <p className="font-sans text-xs text-text-muted">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-iris-400 hover:text-iris-300 underline underline-offset-2 transition-colors"
          >
            Sign in
          </a>
        </p>
        <button
          type="button"
          disabled={skipping || !authInitialised}
          onClick={async () => {
            setSkipping(true)
            const result = await skipOnboarding()
            // skipOnboarding redirects on success — only reach here on error
            if (!result.success) {
              setServerError(result.error)
              setPhase('error')
              setSkipping(false)
            }
          }}
          className="font-sans text-xs text-text-muted hover:text-iris-300 underline underline-offset-2 transition-colors disabled:opacity-50"
        >
          {skipping ? 'Skipping…' : 'Skip interview — set up profile manually'}
        </button>
      </div>
    </div>
  )
}
