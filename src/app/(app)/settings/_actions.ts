'use server'

import { createClient } from '@/lib/supabase/server'
import { TonePreferenceSchema } from '@/types'
import type { Result } from '@/types'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  sobrietyDate: z.string().date().optional().or(z.literal('')),
  substances: z.array(z.string().min(1)).optional(),
  goals: z.array(z.string().min(1)).optional(),
  triggers: z.array(z.string().min(1)).optional(),
  tonePreference: TonePreferenceSchema.optional(),
})

export async function updateProfile(raw: unknown): Promise<Result<{ updated: true }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const parsed = UpdateProfileSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join('; ') }
  }

  const { displayName, sobrietyDate, substances, goals, triggers, tonePreference } = parsed.data

  const updateData: Record<string, unknown> = {
    display_name: displayName || null,
    sobriety_date: sobrietyDate || null,
    updated_at: new Date().toISOString(),
  }
  if (substances !== undefined) updateData.substances = substances
  if (goals !== undefined) updateData.goals = goals
  if (triggers !== undefined) updateData.triggers = triggers
  if (tonePreference !== undefined) updateData.tone_preference = tonePreference

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', user.id)

  if (updateError) {
    console.error('[updateProfile] error:', updateError)
    return { success: false, error: 'Failed to save changes. Please try again.' }
  }

  return { success: true, data: { updated: true } }
}
