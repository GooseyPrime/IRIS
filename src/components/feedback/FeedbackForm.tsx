'use client'

import { useState } from 'react'

const CATEGORIES = ['Bug', 'Suggestion', 'Praise', 'Other'] as const

export function FeedbackForm() {
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [category, setCategory] = useState<string>('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        npsScore: npsScore ?? undefined,
        comment: comment || undefined,
        category: category || undefined,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Something went wrong' })) as { error?: string }
      setError(data.error ?? 'Something went wrong')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full border border-gold-500/40 bg-gold-500/10 flex items-center justify-center">
          <span className="text-2xl text-gold-400" aria-hidden="true">&#10003;</span>
        </div>
        <p className="font-serif text-xl text-text-primary">
          Thank you — your feedback shapes IRIS.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
      {/* NPS */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-sans text-sm text-text-secondary mb-1">
          How likely are you to recommend IRIS to a friend in recovery?
        </legend>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="NPS score">
          {Array.from({ length: 11 }, (_, i) => i).map((score) => {
            const selected = npsScore === score
            return (
              <button
                key={score}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setNpsScore(score)}
                className={[
                  'w-10 h-10 rounded-lg border font-sans text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                  selected
                    ? 'border-iris-500 bg-iris-500/20 text-text-primary'
                    : 'border-iris-900/40 bg-surface-1 text-text-muted hover:border-iris-600/50 hover:bg-surface-2',
                ].join(' ')}
              >
                {score}
              </button>
            )
          })}
        </div>
        <div className="flex justify-between">
          <span className="font-sans text-xs text-text-muted">Not likely</span>
          <span className="font-sans text-xs text-text-muted">Very likely</span>
        </div>
      </fieldset>

      {/* Category */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-sans text-sm text-text-secondary mb-1">Category</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const selected = category === cat
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(selected ? '' : cat)}
                className={[
                  'px-4 py-2 rounded-full border font-sans text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                  selected
                    ? 'border-iris-500 bg-iris-500/15 text-text-primary'
                    : 'border-iris-900/40 bg-surface-1 text-text-secondary hover:border-iris-600/60 hover:bg-surface-2',
                ].join(' ')}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Comment */}
      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="comment" className="font-sans text-sm text-text-secondary">
          Comments
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Tell us more…"
          className="bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors resize-none"
        />
        <p className="font-sans text-xs text-text-muted text-right">{comment.length}/2000</p>
      </fieldset>

      {error && (
        <p className="font-sans text-sm text-error text-center" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 rounded-xl bg-iris-600 text-white font-sans text-sm font-medium hover:bg-iris-500 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
      >
        {loading ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  )
}
