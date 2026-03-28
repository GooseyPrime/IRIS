import Link from 'next/link'
import { ReminderSettings } from '@/components/reminders/ReminderSettings'
import { LogoutButton } from '@/components/auth/LogoutButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Reminders',
  description: 'Set up daily check-in reminders.',
}

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-iris-900/20 bg-surface-0/90 backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <span className="font-serif font-light text-lg tracking-tight text-text-primary">
          Reminders
        </span>
        <LogoutButton
          label="Log out"
          className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded disabled:opacity-60"
        />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <ReminderSettings />
      </main>
    </div>
  )
}
