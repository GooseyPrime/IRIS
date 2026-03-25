import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CrisisReportSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid(),
  tier: z.union([z.literal(1), z.literal(2)]),
  matchedPattern: z.string().max(500).nullable().optional(),
})

/**
 * POST /api/crisis
 *
 * Persists a tier-1 or tier-2 crisis disclosure that was intercepted
 * client-side and never forwarded to GPT-4o.  Writes both a flagged
 * `messages` row and an immutable `crisis_events` audit record.
 */
export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const parsed = CrisisReportSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.errors.map((e) => e.message).join('; ') }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { message, conversationId, tier } = parsed.data

  // Persist the user message as flagged
  const { data: messageRow, error: msgErr } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      user_id: user.id,
      flagged_crisis: true,
      crisis_tier: tier,
    })
    .select('id')
    .single()

  if (msgErr) {
    console.error('[crisis] failed to persist crisis message:', msgErr)
    return new Response(JSON.stringify({ error: 'Failed to persist message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Write an immutable crisis audit record
  const { error: crisisErr } = await supabase.from('crisis_events').insert({
    user_id: user.id,
    message_id: messageRow.id,
    crisis_tier: tier,
    message_text: message,
    resolved: false,
  })

  if (crisisErr) {
    console.error('[crisis] failed to persist crisis_event:', crisisErr)
    return new Response(JSON.stringify({ error: 'Failed to persist crisis event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(null, { status: 204 })
}
