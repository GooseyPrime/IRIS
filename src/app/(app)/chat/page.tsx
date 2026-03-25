import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — New Chat',
  description: 'Start a conversation with your AI sobriety companion.',
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  if (error || !session) {
    redirect('/dashboard')
  }

  redirect(`/chat/${session.id}`)
}
