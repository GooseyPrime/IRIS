import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { SettingsForm } from '@/components/settings/SettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Settings',
  description: 'Manage your profile and preferences.',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, sobriety_date, substances, goals, triggers, tone_preference')
    .eq('id', user.id)
    .single()

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif font-semibold text-2xl text-text-primary">Settings</h1>
          <p className="font-sans text-sm text-text-secondary mt-1">
            Update your profile and preferences.
          </p>
        </div>

        <SettingsForm
          initialDisplayName={profile?.display_name ?? ''}
          initialSobrietyDate={profile?.sobriety_date ?? ''}
          initialSubstances={profile?.substances ?? []}
          initialGoals={profile?.goals ?? []}
          initialTriggers={profile?.triggers ?? []}
          initialTonePreference={profile?.tone_preference ?? 'warm'}
        />

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
