import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Feedback',
  description: 'Share your feedback to help improve IRIS.',
}

export default function FeedbackPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif font-semibold text-2xl text-text-primary">Give Feedback</h1>
          <p className="font-sans text-sm text-text-secondary mt-1">
            Your feedback shapes IRIS. Tell us what&apos;s working and what could be better.
          </p>
        </div>

        <FeedbackForm />

        <div className="pt-4 border-t border-iris-900/30">
          <a
            href="/dashboard"
            className="font-sans text-sm text-iris-400 hover:text-iris-300 underline underline-offset-2 transition-colors"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </DashboardShell>
  )
}
