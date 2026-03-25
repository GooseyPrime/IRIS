'use server'

import { createClient } from '@/lib/supabase/server'
import {
  PaginatedSessionsSchema,
  SESSIONS_PAGE_SIZE,
} from '@/types'
import type { Result, SessionPreview } from '@/types'

interface PaginatedSessions {
  sessions: SessionPreview[]
  nextCursor: string | null
}

export async function fetchSessions(
  raw: unknown,
): Promise<Result<PaginatedSessions>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const parsed = PaginatedSessionsSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: 'Invalid pagination parameters' }
  }

  const { cursor } = parsed.data
  const limit = SESSIONS_PAGE_SIZE

  let query = supabase
    .from('sessions')
    .select('id, title, created_at, ended_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: sessions, error } = await query

  if (error) {
    console.error('[fetchSessions] query error:', error)
    return { success: false, error: 'Failed to load sessions' }
  }

  if (!sessions) {
    return { success: true, data: { sessions: [], nextCursor: null } }
  }

  const hasMore = sessions.length > limit
  const pageItems = hasMore ? sessions.slice(0, limit) : sessions
  const nextCursor = hasMore
    ? (pageItems[pageItems.length - 1]?.created_at ?? null)
    : null

  const sessionIds = pageItems.map((s) => s.id)

  const { data: messageCounts } = await supabase
    .from('messages')
    .select('conversation_id, content')
    .in('conversation_id', sessionIds)
    .eq('user_id', user.id)

  const countMap = new Map<string, number>()
  const previewMap = new Map<string, string>()

  if (messageCounts) {
    for (const msg of messageCounts) {
      countMap.set(
        msg.conversation_id,
        (countMap.get(msg.conversation_id) ?? 0) + 1,
      )
      if (!previewMap.has(msg.conversation_id)) {
        previewMap.set(
          msg.conversation_id,
          msg.content.length > 100
            ? msg.content.slice(0, 100) + '...'
            : msg.content,
        )
      }
    }
  }

  const sessionPreviews: SessionPreview[] = pageItems.map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.created_at,
    endedAt: s.ended_at,
    messageCount: countMap.get(s.id) ?? 0,
    lastMessagePreview: previewMap.get(s.id) ?? null,
  }))

  return {
    success: true,
    data: { sessions: sessionPreviews, nextCursor },
  }
}
