'use client'

import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function SettingsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <DashboardShell>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="font-serif text-xl text-text-primary">Something went wrong</p>
        <p className="font-sans text-sm text-text-secondary">
          We couldn&apos;t load your settings. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-xl bg-iris-600 text-white font-sans text-sm font-medium hover:bg-iris-500 transition-colors"
        >
          Try again
        </button>
      </div>
    </DashboardShell>
  )
}
