'use server'

import { createClient } from '@/lib/supabase/server'
import { EveningReflectionSchema } from '@/types'
import type { Result } from '@/types'

export async function saveReflection(
  raw: unknown,
): Promise<Result<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const parsed = EveningReflectionSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join('; ')
    return { success: false, error: message }
  }

  const { soberToday, mood, activities, journal } = parsed.data

  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      mood,
      emotions: activities,
      note: journal ?? null,
      sober_today: soberToday,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[saveReflection] insert error:', error)
    return { success: false, error: 'Failed to save your reflection. Please try again.' }
  }

  return { success: true, data: { id: data.id } }
}
