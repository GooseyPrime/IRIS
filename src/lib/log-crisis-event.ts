import { createClient } from '@/lib/supabase/server'

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

interface LogCrisisEventParams {
  supabase: ServerSupabaseClient
  userId: string
  messageId: string | null
  crisisTier: number
  messageText: string
}

/**
 * Persist an immutable crisis event audit record.
 *
 * This function is the single point of truth for crisis_events writes.
 * Both /api/chat and /api/crisis call this instead of inlining inserts,
 * ensuring consistent format and a single place for future enhancements
 * (admin alerts, webhook dispatch, etc.).
 *
 * crisis_events rows are NEVER deleted — they are a permanent audit trail.
 */
export async function logCrisisEvent({
  supabase,
  userId,
  messageId,
  crisisTier,
  messageText,
}: LogCrisisEventParams): Promise<{ success: boolean; error?: string | undefined }> {
  const { error } = await supabase.from('crisis_events').insert({
    user_id: userId,
    message_id: messageId,
    crisis_tier: crisisTier,
    message_text: messageText,
    resolved: false,
  })

  if (error) {
    console.error('[logCrisisEvent] failed to persist crisis_event:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
