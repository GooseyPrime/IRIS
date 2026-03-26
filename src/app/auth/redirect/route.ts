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

  if (!profile || !profile.onboarding_completed) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
