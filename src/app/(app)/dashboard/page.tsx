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
    .select('sobriety_date, display_name, onboarding_completed, goals, tone_preference')
    .eq('id', user.id)
    .single()

  // If no profile or onboarding not completed, send them through onboarding
  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  // Check if this is a new user (no chat sessions yet) to show welcome plan
  const { count: sessionCount } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const isNewUser = (sessionCount ?? 0) === 0

  return (
    <DashboardShell>
      {/* Sobriety counter — hero section */}
      <section className="bg-surface-1 rounded-3xl border border-iris-900/30 px-6 py-2 shadow-[0_8px_40px_rgba(107,76,230,0.06)] mb-8">
        <SobrietyCounter
          sobrietyDate={profile.sobriety_date}
          displayName={profile.display_name}
        />
      </section>

      {/* Welcome plan for new users */}
      {isNewUser && (
        <section className="bg-surface-1 rounded-3xl border border-gold-500/20 px-6 py-6 shadow-[0_8px_40px_rgba(107,76,230,0.06)] mb-8">
          <h2 className="font-serif font-semibold text-xl text-text-primary mb-3">
            Welcome to IRIS — here is your plan
          </h2>
          <p className="font-sans text-sm text-text-secondary leading-relaxed mb-4">
            Recovery is a journey, and IRIS is here to walk it with you. Here is how to get the most out of your companion:
          </p>
          <ol className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-serif text-xs text-gold-400">1</span>
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Start each morning with a check-in.</span>{' '}
                Rate your mood, note whether you stayed sober, and set an intention for the day.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-serif text-xs text-gold-400">2</span>
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Talk to IRIS any time.</span>{' '}
                Whether you need encouragement, are facing a trigger, or just want someone to listen — IRIS is always here.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-serif text-xs text-gold-400">3</span>
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Reflect each evening.</span>{' '}
                Review your day, celebrate wins (even small ones), and let IRIS help you process what happened.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center font-serif text-xs text-gold-400">4</span>
              <p className="font-sans text-sm text-text-secondary leading-relaxed">
                <span className="text-text-primary font-medium">Update your profile as you grow.</span>{' '}
                Your goals, triggers, and preferences can change — visit{' '}
                <Link href="/settings" className="text-iris-400 hover:text-iris-300 underline underline-offset-2">Settings</Link>{' '}
                any time to keep things current.
              </p>
            </li>
          </ol>
          {profile.goals && profile.goals.length > 0 && (
            <div className="border-t border-iris-900/20 pt-4">
              <p className="font-sans text-xs text-text-muted uppercase tracking-[0.1em] mb-2">Your goals</p>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal: string) => (
                  <span key={goal} className="px-3 py-1 rounded-full bg-iris-600/15 border border-iris-500/20 font-sans text-xs text-iris-300">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

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
