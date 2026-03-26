import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { SobrietyCounter } from '@/components/dashboard/SobrietyCounter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Dashboard',
  description: 'Your sobriety journey at a glance.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('sobriety_date, display_name, onboarding_completed')
    .eq('id', user.id)
    .single()

  // If no profile or onboarding not completed, send them back through onboarding
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <DashboardShell>
      {/* Sobriety counter — hero section */}
      <section className="bg-surface-1 rounded-3xl border border-iris-900/30 px-6 py-2 shadow-[0_8px_40px_rgba(107,76,230,0.06)] mb-8">
        <SobrietyCounter
          sobrietyDate={profile.sobriety_date}
          displayName={profile.display_name}
        />
      </section>

      {/* Primary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard
          title="Morning Check-in"
          description="Start your day with intention."
          href="/check-in"
        />
        <DashboardCard
          title="Talk to IRIS"
          description="Your AI companion is here."
          href="/chat"
        />
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <DashboardCard
          title="Evening Reflection"
          description="How was your day? Check in with IRIS."
          href="/reflection"
        />
        <DashboardCard
          title="Past Sessions"
          description="Browse your conversation history."
          href="/history"
        />
      </div>

      {/* Tertiary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <DashboardCard
          title="Reminders"
          description="Set morning and evening check-in reminders."
          href="/reminders"
        />
        <DashboardCard
          title="My Profile"
          description="View and edit your preferences."
          href="/settings"
        />
      </div>

      {/* Feedback link */}
      <div className="mt-6 text-center">
        <Link
          href="/feedback"
          className="font-sans text-sm text-text-muted hover:text-iris-400 underline underline-offset-2 transition-colors"
        >
          Give Feedback
        </Link>
      </div>
    </DashboardShell>
  )
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className={[
        'flex flex-col gap-2 p-6 rounded-2xl border border-iris-900/30 bg-surface-1',
        'transition-all duration-200',
        'hover:border-iris-600/50 hover:bg-surface-2 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
      ].join(' ')}
    >
      <p className="font-sans font-semibold text-sm text-text-primary">{title}</p>
      <p className="font-sans text-xs text-text-muted leading-relaxed">{description}</p>
    </Link>
  )
}
