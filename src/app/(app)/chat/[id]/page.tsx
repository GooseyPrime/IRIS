import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatShell } from '@/components/chat/ChatShell'
import { ChatInterface } from '@/components/chat/ChatInterface'
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
    <ChatShell displayName={profile?.display_name ?? null}>
      <ChatInterface
        sessionId={session.id}
        {...(userContext !== undefined ? { userContext } : {})}
      />
    </ChatShell>
  )
}
