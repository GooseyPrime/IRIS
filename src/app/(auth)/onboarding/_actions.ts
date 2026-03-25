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
  } = await supabase.auth.getUser()

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
    console.error('[completeOnboarding] upsert error:', upsertError)
    return { success: false, error: 'Failed to save your profile. Please try again.' }
  }

  redirect('/dashboard')
}
