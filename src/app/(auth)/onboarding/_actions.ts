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

/**
 * Skip the onboarding interview and create a minimal profile with defaults.
 * Redirects the user to /settings so they can fill in their profile manually.
 */
export async function skipOnboarding(): Promise<Result<{ userId: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('[skipOnboarding] getUser error:', userError)
    return { success: false, error: 'Authentication error. Please sign in again.' }
  }

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check whether the user already has a profile to avoid overwriting real data
  const { data: existingProfile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('[skipOnboarding] fetch error:', {
      code: fetchError.code,
      message: fetchError.message,
      userId: user.id,
    })
    return { success: false, error: 'Failed to save your profile. Please try again.' }
  }

  if (existingProfile) {
    // Profile already exists — only mark onboarding complete, preserve all other data
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      console.error('[skipOnboarding] update error:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        userId: user.id,
      })
      return { success: false, error: 'Failed to save your profile. Please try again.' }
    }
  } else {
    // No profile yet — insert with sensible defaults
    const { error: insertError } = await supabase.from('user_profiles').insert({
      id: user.id,
      substances: ['other'],
      sobriety_date: null,
      goals: ['Stay sober one day at a time'],
      triggers: [],
      tone_preference: 'warm',
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('[skipOnboarding] insert error:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        userId: user.id,
      })
      return { success: false, error: 'Failed to save your profile. Please try again.' }
    }
  }

  // Check for pending sponsorships by the user's email
  if (user.email) {
    const { data: pendingSponsorships } = await supabase
      .from('pending_sponsorships')
      .select('id')
      .eq('recipient_email', user.email)
      .eq('applied', false)

    if (pendingSponsorships && pendingSponsorships.length > 0) {
      await supabase
        .from('user_profiles')
        .update({ account_tier: 'sponsor' })
        .eq('id', user.id)

      const ids = pendingSponsorships.map((s) => s.id)
      await supabase
        .from('pending_sponsorships')
        .update({ applied: true, applied_at: new Date().toISOString() })
        .in('id', ids)

      console.log(`[skipOnboarding] Applied ${ids.length} pending sponsorship(s) for ${user.email}`)
    }
  }

  redirect('/settings')
}
