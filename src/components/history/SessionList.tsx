'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { SessionCard } from '@/components/history/SessionCard'
import { Button } from '@/components/ui/Button'
import { fetchSessions } from '@/app/(app)/history/_actions'
import type { SessionPreview } from '@/types'

interface SessionListProps {
  initialSessions: SessionPreview[]
  initialCursor: string | null
}

export function SessionList({
  initialSessions,
  initialCursor,
}: SessionListProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [cursor, setCursor] = useState(initialCursor)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (!cursor || isLoading) return

    setIsLoading(true)
    setError(null)

    const result = await fetchSessions({ cursor })

    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSessions((prev) => [...prev, ...result.data.sessions])
    setCursor(result.data.nextCursor)
    setIsLoading(false)
  }, [cursor, isLoading])

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-iris-600/20 flex items-center justify-center mb-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6C4 4.34 5.34 3 7 3h10c1.66 0 3 1.34 3 3v8c0 1.66-1.34 3-3 3h-5l-4 4v-4H7c-1.66 0-3-1.34-3-3V6Z"
              stroke="currentColor"
              className="text-iris-400"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="font-serif font-light text-xl text-text-primary mb-2">
          No conversations yet
        </h3>
        <p className="font-sans text-sm text-text-secondary max-w-xs leading-relaxed mb-6">
          Start a conversation with IRIS and it will appear here.
        </p>
        <Link href="/chat">
          <Button size="sm">Talk to IRIS</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session, index) => (
        <div
          key={session.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}
        >
          <SessionCard session={session} />
        </div>
      ))}

      {error !== null && (
        <p className="font-sans text-xs text-error text-center py-2">
          {error}
        </p>
      )}

      {cursor !== null && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            loading={isLoading}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
