'use server'

import { createClient } from '@/lib/supabase/server'
import { OnboardingDataSchema } from '@/types'
import type { Result } from '@/types'
import { redirect } from 'next/navigation'

export async function completeOnboarding(
  raw: unknown,
): Promise<Result<{ userId: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('[completeOnboarding] getUser error:', userError)
    return { success: false, error: 'Authentication error. Please sign in again.' }
  }

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const parsed = OnboardingDataSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join('; ')
    return { success: false, error: message }
  }

  const { substances, sobrietyDate, sobrietyDateUnknown, goals, triggers, tonePreference } =
    parsed.data

  const { error: upsertError } = await supabase.from('user_profiles').upsert({
    id: user.id,
    substances,
    sobriety_date: sobrietyDateUnknown ? null : (sobrietyDate ?? null),
    goals,
    triggers,
    tone_preference: tonePreference,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  })

  if (upsertError) {
    console.error('[completeOnboarding] upsert error:', {
      code: upsertError.code,
      message: upsertError.message,
      details: upsertError.details,
      hint: upsertError.hint,
      userId: user.id,
    })
    return { success: false, error: 'Failed to save your profile. Please try again.' }
  }

  // Check for pending sponsorships by the user's email
  if (user.email) {
    const { data: pendingSponsorships } = await supabase
      .from('pending_sponsorships')
      .select('id')
      .eq('recipient_email', user.email)
      .eq('applied', false)

    if (pendingSponsorships && pendingSponsorships.length > 0) {
      // Apply sponsorship — upgrade account tier
      await supabase
        .from('user_profiles')
        .update({ account_tier: 'sponsor' })
        .eq('id', user.id)

      // Mark sponsorships as applied
      const ids = pendingSponsorships.map((s) => s.id)
      await supabase
        .from('pending_sponsorships')
        .update({ applied: true, applied_at: new Date().toISOString() })
        .in('id', ids)

      console.log(`[completeOnboarding] Applied ${ids.length} pending sponsorship(s) for ${user.email}`)
    }
  }

  redirect('/dashboard')
}
