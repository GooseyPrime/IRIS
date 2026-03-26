import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CinematicOnboarding } from '@/components/onboarding/CinematicOnboarding'

export const metadata: Metadata = {
  title: 'IRIS — Your Journey Begins',
  description: 'Tell us a little about yourself so we can personalise your IRIS experience.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    // Already completed onboarding → go straight to dashboard
    if (profile?.onboarding_completed) {
      redirect('/dashboard')
    }

    // Non-anonymous users (real email/OAuth accounts) already have an account.
    // Skip the interview and send them to settings to fill in their profile.
    const isAnonymous = user.is_anonymous === true
    if (!isAnonymous) {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        substances: ['other'],
        sobriety_date: null,
        goals: ['Stay sober one day at a time'],
        triggers: [],
        tone_preference: 'warm',
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      redirect('/settings')
    }
  }

  return <CinematicOnboarding />
}
