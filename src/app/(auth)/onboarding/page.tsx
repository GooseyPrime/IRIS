import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CinematicOnboarding } from '@/components/onboarding/CinematicOnboarding'

export const metadata: Metadata = {
  title: 'IRIS — Your Journey Begins',
  description: 'Tell us a little about yourself so we can personalise your IRIS experience.',
}

export default async function OnboardingPage() {
  // If the user is already authenticated and has completed onboarding,
  // redirect them to the dashboard instead of showing the interview again.
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

    if (profile?.onboarding_completed) {
      redirect('/dashboard')
    }
  }

  return <CinematicOnboarding />
}
