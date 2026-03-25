'use client'

import { useCallback, useState } from 'react'
import { submitCheckIn } from '@/app/(app)/check-in/_actions'
import { MoodSelector } from './MoodSelector'
import { EmotionTags } from './EmotionTags'
import { SobrietyPledge } from './SobrietyPledge'
import { Button } from '@/components/ui/Button'
import type { CheckInRow } from '@/app/(app)/check-in/_actions'

interface CheckInFormProps {
  /** Populated if the user already checked in today — renders read-only summary. */
  existingCheckIn: CheckInRow | null
}

interface FormState {
  mood: number | null
  emotions: string[]
  note: string
  soberToday: boolean
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Struggling',
  2: 'Difficult',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
}

const MOOD_EMOJIS: Record<number, string> = {
  1: '😔',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😊',
}

export function CheckInForm({ existingCheckIn }: CheckInFormProps) {
  const [form, setForm] = useState<FormState>({
    mood: null,
    emotions: [],
    note: '',
    soberToday: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<CheckInRow | null>(null)

  const handleSubmit = useCallback(async () => {
    if (form.mood === null) return
    setSubmitting(true)
    setServerError(null)

    const payload = {
      mood: form.mood,
      emotions: form.emotions,
      note: form.note.trim() || undefined,
      soberToday: form.soberToday,
    }

    const result = await submitCheckIn(payload)

    if (result.success) {
      setSubmitted(result.data)
    } else {
      setServerError(result.error)
    }
    setSubmitting(false)
  }, [form])

  // -----------------------------------------------------------------------
  // Already completed today — read-only summary
  // -----------------------------------------------------------------------
  if (existingCheckIn || submitted) {
    const row = submitted ?? existingCheckIn
    if (!row) return null

    return (
      <div className="max-w-lg mx-auto flex flex-col gap-6 animate-fade-up">
        <div className="flex flex-col gap-1">
          <p className="font-sans text-[0.75rem] uppercase tracking-[0.2em] text-gold-500">
            Today&apos;s Check-in
          </p>
          <h1 className="font-serif font-semibold text-3xl text-text-primary">
            {submitted ? 'Check-in saved ✓' : 'Already checked in'}
          </h1>
          <p className="font-sans text-sm text-text-secondary">
            {submitted
              ? 'Great work showing up for yourself today.'
              : 'You already completed your check-in today.'}
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-surface-1 rounded-2xl border border-iris-900/30 p-6 flex flex-col gap-5">
          {/* Mood */}
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {MOOD_EMOJIS[row.mood] ?? '😐'}
            </span>
            <div>
              <p className="font-sans text-xs text-text-muted uppercase tracking-[0.12em]">
                Mood
              </p>
              <p className="font-sans font-semibold text-sm text-text-primary">
                {MOOD_LABELS[row.mood] ?? String(row.mood)} ({row.mood}/5)
              </p>
            </div>
          </div>

          {/* Sobriety */}
          <div className="flex items-center gap-3">
            <span
              className={['text-lg', row.sober_today ? 'text-success' : 'text-gold-400'].join(' ')}
              aria-hidden="true"
            >
              {row.sober_today ? '✓' : '◇'}
            </span>
            <div>
              <p className="font-sans text-xs text-text-muted uppercase tracking-[0.12em]">
                Sobriety pledge
              </p>
              <p
                className={[
                  'font-sans font-semibold text-sm',
                  row.sober_today ? 'text-success' : 'text-gold-400',
                ].join(' ')}
              >
                {row.sober_today ? 'Stayed sober today' : 'Reached out for support'}
              </p>
            </div>
          </div>

          {/* Emotions */}
          {row.emotions.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-xs text-text-muted uppercase tracking-[0.12em]">
                Emotions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {row.emotions.map((e) => (
                  <span
                    key={e}
                    className="px-3 py-1 rounded-full border border-iris-500/30 bg-iris-500/10 font-sans text-xs text-iris-200"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {row.note && (
            <div className="flex flex-col gap-1">
              <p className="font-sans text-xs text-text-muted uppercase tracking-[0.12em]">
                Note
              </p>
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                {row.note}
              </p>
            </div>
          )}
        </div>

        <a
          href="/dashboard"
          className="text-center font-sans text-sm text-iris-400 hover:text-iris-300 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
        >
          ← Back to dashboard
        </a>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Active form
  // -----------------------------------------------------------------------
  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <p className="font-sans text-[0.75rem] uppercase tracking-[0.2em] text-gold-500">
          Daily ritual
        </p>
        <h1 className="font-serif font-semibold text-3xl text-text-primary">
          Morning check-in
        </h1>
        <p className="font-sans text-sm text-text-secondary">
          A moment to pause and notice how you&apos;re doing.
        </p>
      </div>

      {/* Mood */}
      <section className="bg-surface-1 rounded-2xl border border-iris-900/30 p-5">
        <MoodSelector
          value={form.mood}
          onChange={(mood) => setForm((s) => ({ ...s, mood }))}
        />
      </section>

      {/* Sobriety pledge */}
      <section className="bg-surface-1 rounded-2xl border border-iris-900/30 p-5">
        <SobrietyPledge
          value={form.soberToday}
          onChange={(soberToday) => setForm((s) => ({ ...s, soberToday }))}
        />
      </section>

      {/* Emotion tags */}
      <section className="bg-surface-1 rounded-2xl border border-iris-900/30 p-5">
        <EmotionTags
          value={form.emotions}
          onChange={(emotions) => setForm((s) => ({ ...s, emotions }))}
        />
      </section>

      {/* Optional note */}
      <section className="bg-surface-1 rounded-2xl border border-iris-900/30 p-5 flex flex-col gap-2">
        <label
          htmlFor="check-in-note"
          className="font-sans text-sm font-medium text-text-secondary"
        >
          Anything else on your mind?{' '}
          <span className="font-normal text-text-muted">(optional)</span>
        </label>
        <textarea
          id="check-in-note"
          value={form.note}
          onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
          rows={3}
          maxLength={1000}
          placeholder="A thought, intention, or gratitude for today…"
          className="w-full bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors resize-none"
        />
        <p className="font-sans text-xs text-text-muted text-right">
          {form.note.length}/1000
        </p>
      </section>

      {/* Submit */}
      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => void handleSubmit()}
          loading={submitting}
          disabled={form.mood === null}
          className="w-full"
        >
          {submitting ? 'Saving…' : 'Save check-in'}
        </Button>

        {form.mood === null && (
          <p className="font-sans text-xs text-text-muted text-center">
            Select your mood to continue
          </p>
        )}

        {serverError && (
          <p className="font-sans text-sm text-error text-center" role="alert">
            {serverError}
          </p>
        )}
      </div>

      <a
        href="/dashboard"
        className="text-center font-sans text-sm text-text-muted hover:text-text-secondary underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
      >
        ← Back to dashboard
      </a>
    </div>
  )
}
