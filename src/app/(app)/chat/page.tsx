import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { computeSobrietyTime } from '@/lib/sobriety'
import { ChatShell } from '@/components/chat/ChatShell'
import { ChatInterface } from '@/components/chat/ChatInterface'

export const metadata: Metadata = {
  title: 'IRIS — Chat',
  description: 'Talk to IRIS, your AI sobriety companion.',
}

/** Generate a stable session UUID for this conversation. */
function newSessionId(): string {
  return crypto.randomUUID()
}

export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the profile for personalising the AI system prompt
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, sobriety_date, tone_preference, triggers, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  // Compute days sober for the system prompt
  let daysSober = 0
  if (profile.sobriety_date) {
    const { days } = computeSobrietyTime(profile.sobriety_date)
    daysSober = days
  }

  // Create a new session row for this conversation
  const sessionId = newSessionId()
  await supabase.from('sessions').insert({
    id: sessionId,
    user_id: user.id,
    title: null,
  })

  const userContext = {
    name: profile.display_name ?? 'Friend',
    daysSober,
    tone: profile.tone_preference,
    triggers: profile.triggers,
  }

  return (
    <ChatShell displayName={profile.display_name}>
      <ChatInterface sessionId={sessionId} userContext={userContext} />
    </ChatShell>
  )
}
