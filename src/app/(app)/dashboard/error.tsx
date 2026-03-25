'use client'

import { useEffect } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <DashboardShell>
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full border border-error/40 flex items-center justify-center">
          <span className="text-error text-2xl" aria-hidden="true">!</span>
        </div>
        <div>
          <p className="font-serif text-2xl text-text-primary">Something went wrong</p>
          <p className="font-sans text-sm text-text-muted mt-2 max-w-xs mx-auto">
            We couldn&apos;t load your dashboard. This is usually temporary.
          </p>
        </div>
        <button
          onClick={reset}
          className="font-sans text-sm text-iris-400 hover:text-iris-300 underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
        >
          Try again
        </button>
      </div>
    </DashboardShell>
  )
}
