import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReflectionWizard } from '@/components/reflection/ReflectionWizard'
import { computeSobrietyTime } from '@/lib/sobriety'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Evening Reflection',
  description: 'Reflect on your day with your AI sobriety companion.',
}

export default async function ReflectionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, sobriety_date, tone_preference, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  const userContext = {
    name: profile.display_name ?? 'Friend',
    daysSober: profile.sobriety_date
      ? computeSobrietyTime(profile.sobriety_date).days
      : 0,
    tone: profile.tone_preference,
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-iris-900/20 bg-surface-0/90 backdrop-blur-sm">
        <a
          href="/dashboard"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </a>
        <span className="font-serif font-light text-lg tracking-tight text-text-primary">
          IRIS
        </span>
        <div className="w-12" />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <ReflectionWizard userContext={userContext} />
      </main>
    </div>
  )
}
