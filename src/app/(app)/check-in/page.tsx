import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { CheckInForm } from '@/components/check-in/CheckInForm'

export const metadata: Metadata = {
  title: 'IRIS — Daily Check-in',
  description: 'How are you doing today?',
}

/** Midnight (00:00:00) of today in UTC — used as the "today" lower bound. */
function todayUtcMidnight(): string {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString()
}

export default async function CheckInPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if the user already submitted a check-in today (UTC boundary)
  const { data: existing } = await supabase
    .from('check_ins')
    .select('id, user_id, mood, emotions, note, sober_today, created_at')
    .eq('user_id', user.id)
    .gte('created_at', todayUtcMidnight())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <DashboardShell>
      <CheckInForm existingCheckIn={existing ?? null} />
    </DashboardShell>
  )
}
