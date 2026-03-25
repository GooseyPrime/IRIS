import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DisclaimerModal } from '@/components/legal/DisclaimerModal'
import { TherapistFooter } from '@/components/legal/TherapistFooter'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col">{children}</div>
      <TherapistFooter />
      <DisclaimerModal />
    </div>
  )
}
