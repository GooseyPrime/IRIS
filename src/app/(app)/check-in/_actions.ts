'use server'

import { createClient } from '@/lib/supabase/server'
import { CheckInSchema } from '@/types'
import type { Result } from '@/types'
import type { Tables } from '@/types/database'

export type CheckInRow = Tables<'check_ins'>

export async function submitCheckIn(raw: unknown): Promise<Result<CheckInRow>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const parsed = CheckInSchema.safeParse(raw)
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join('; ')
    return { success: false, error: message }
  }

  const { mood, emotions, note, soberToday } = parsed.data

  const { data: raw_data, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      mood,
      emotions,
      note: note ?? null,
      sober_today: soberToday,
    })
    .select('id, created_at, user_id, mood, emotions, note, sober_today')
    .single()

  if (error || !raw_data) {
    console.error('[submitCheckIn] insert error:', error)
    return { success: false, error: 'Could not save your check-in. Please try again.' }
  }

  return { success: true, data: raw_data as CheckInRow }
}
