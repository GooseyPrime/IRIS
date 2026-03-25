import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SessionList } from '@/components/history/SessionList'
import { SESSIONS_PAGE_SIZE } from '@/types'
import type { SessionPreview } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Past Sessions',
  description: 'Browse your conversation history with IRIS.',
}

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const limit = SESSIONS_PAGE_SIZE

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, created_at, ended_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  const rawSessions = sessions ?? []
  const hasMore = rawSessions.length > limit
  const pageItems = hasMore ? rawSessions.slice(0, limit) : rawSessions
  const nextCursor = hasMore
    ? (pageItems[pageItems.length - 1]?.created_at ?? null)
    : null

  const sessionIds = pageItems.map((s) => s.id)

  let messageCounts: Array<{ conversation_id: string; content: string }> = []
  if (sessionIds.length > 0) {
    const { data } = await supabase
      .from('messages')
      .select('conversation_id, content')
      .in('conversation_id', sessionIds)
      .eq('user_id', user.id)

    messageCounts = data ?? []
  }

  const countMap = new Map<string, number>()
  const previewMap = new Map<string, string>()

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

  const sessionPreviews: SessionPreview[] = pageItems.map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.created_at,
    endedAt: s.ended_at,
    messageCount: countMap.get(s.id) ?? 0,
    lastMessagePreview: previewMap.get(s.id) ?? null,
  }))

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-iris-900/20 bg-surface-0/90 backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>
        <span className="font-serif font-light text-lg tracking-tight text-text-primary">
          Past Sessions
        </span>
        <Link
          href="/chat"
          className="font-sans text-sm text-iris-400 hover:text-iris-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded"
        >
          New
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <SessionList
          initialSessions={sessionPreviews}
          initialCursor={nextCursor}
        />
      </main>
    </div>
  )
}
