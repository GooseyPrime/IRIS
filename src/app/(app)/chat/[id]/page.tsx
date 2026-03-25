import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatShell } from '@/components/chat/ChatShell'
import { computeSobrietyTime } from '@/lib/sobriety'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Chat',
  description: 'Talk with your AI sobriety companion.',
}

interface ChatSessionPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatSessionPage({
  params,
}: ChatSessionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, sobriety_date, tone_preference, triggers')
    .eq('id', user.id)
    .single()

  const userContext = profile
    ? {
        name: profile.display_name ?? 'Friend',
        daysSober: profile.sobriety_date
          ? computeSobrietyTime(profile.sobriety_date).days
          : 0,
        tone: profile.tone_preference,
        triggers: profile.triggers,
      }
    : undefined

  return (
    <div className="flex flex-col h-screen bg-surface-0">
      <ChatHeader />
      <ChatShell sessionId={session.id} userContext={userContext} />
    </div>
  )
}

function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-iris-900/20 bg-surface-0/90 backdrop-blur-sm">
      <a
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
      </a>
      <span className="font-serif font-light text-lg tracking-tight text-text-primary">
        IRIS
      </span>
      <div className="w-12" />
    </header>
  )
}
