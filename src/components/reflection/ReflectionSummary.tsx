'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface UserContext {
  name: string
  daysSober: number
  tone: string
}

interface ReflectionSummaryProps {
  soberToday: boolean
  mood: number
  activities: string[]
  journal: string
  userContext?: UserContext | undefined
  onDone: () => void
}

export function ReflectionSummary({
  soberToday,
  mood,
  activities,
  journal,
  userContext,
  onDone,
}: ReflectionSummaryProps) {
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setSummary('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soberToday,
          mood,
          activities,
          journal: journal || undefined,
          userContext,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream')
      }

      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const result = await reader.read()
        done = result.done
        if (result.value) {
          setSummary((prev) => prev + decoder.decode(result.value, { stream: !done }))
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(
        err instanceof Error ? err.message : 'Failed to generate summary',
      )
    } finally {
      setIsLoading(false)
    }
  }, [soberToday, mood, activities, journal, userContext])

  useEffect(() => {
    fetchSummary()
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchSummary])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[0.75rem] uppercase tracking-[0.2em] text-gold-500 mb-2">
          Your Evening Summary
        </p>
        <h2 className="font-serif font-light text-2xl text-text-primary">
          IRIS reflects
        </h2>
      </div>

      <div className="bg-surface-1 rounded-2xl border border-iris-900/30 p-6 max-w-md mx-auto min-h-[120px]">
        {isLoading && summary.length === 0 && (
          <div className="flex items-center gap-2 text-text-muted">
            <span
              className="w-4 h-4 rounded-full border-2 border-iris-400 border-t-transparent animate-spin"
              aria-hidden="true"
            />
            <span className="font-sans text-sm">IRIS is reflecting...</span>
          </div>
        )}

        {error !== null && (
          <div className="space-y-3">
            <p className="font-sans text-sm text-error">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchSummary}>
              Try again
            </Button>
          </div>
        )}

        {summary.length > 0 && (
          <p className="font-sans text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onDone}
          disabled={isLoading && summary.length === 0}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
