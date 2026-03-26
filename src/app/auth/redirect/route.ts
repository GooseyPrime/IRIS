import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * User state detection + routing.
 *
 * Runs after login/OAuth to decide where the user should go:
 * - No auth        → /login
 * - No profile or onboarding incomplete → /onboarding
 * - Onboarding complete                 → /dashboard
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // Non-anonymous users (real email/OAuth accounts) — create a default
  // profile, mark onboarding complete, and send them to the dashboard.
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
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // Anonymous users without completed onboarding → start the interview
  return NextResponse.redirect(`${origin}/onboarding`)
}
