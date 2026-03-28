import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatShortDate } from '@/lib/format-date'
import { LogoutButton } from '@/components/auth/LogoutButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IRIS — Admin',
  description: 'Activity log, crisis events, and flagged messages.',
}

const ADMIN_EMAILS = (process.env.IRIS_ADMIN_EMAILS ?? '').split(',').filter(Boolean)

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin =
    ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email ?? '')

  if (!isAdmin) redirect('/dashboard')

  const [crisisResult, flaggedResult, activityResult] = await Promise.all([
    supabase
      .from('crisis_events')
      .select('id, created_at, user_id, crisis_tier, message_text, resolved')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('messages')
      .select('id, created_at, user_id, conversation_id, content, crisis_tier')
      .eq('flagged_crisis', true)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('messages')
      .select('id, created_at, user_id, role, content, conversation_id')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const crisisEvents = crisisResult.data ?? []
  const flaggedMessages = flaggedResult.data ?? []
  const recentActivity = activityResult.data ?? []

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-iris-900/20 bg-surface-0/90 backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors font-sans text-sm rounded"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <span className="font-serif font-light text-lg tracking-tight text-text-primary">
          Admin
        </span>
        <LogoutButton
          label="Log out"
          className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded disabled:opacity-60"
        />
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Crisis events */}
        <AdminSection
          title="Crisis Events"
          count={crisisEvents.length}
          color="text-error"
        >
          {crisisEvents.length === 0 ? (
            <EmptyState text="No crisis events recorded." />
          ) : (
            <div className="space-y-2">
              {crisisEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-1 border border-iris-900/20"
                >
                  <TierBadge tier={e.crisis_tier} />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs text-text-muted">
                      {formatShortDate(e.created_at)} · {e.user_id.slice(0, 8)}...
                    </p>
                    <p className="font-sans text-sm text-text-primary mt-1 line-clamp-2">
                      {e.message_text}
                    </p>
                  </div>
                  <span
                    className={[
                      'font-sans text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full',
                      e.resolved
                        ? 'bg-success/15 text-success'
                        : 'bg-error/15 text-error',
                    ].join(' ')}
                  >
                    {e.resolved ? 'Resolved' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AdminSection>

        {/* Flagged messages */}
        <AdminSection
          title="Flagged Messages"
          count={flaggedMessages.length}
          color="text-gold-400"
        >
          {flaggedMessages.length === 0 ? (
            <EmptyState text="No flagged messages." />
          ) : (
            <div className="space-y-2">
              {flaggedMessages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-1 border border-iris-900/20"
                >
                  {m.crisis_tier !== null && <TierBadge tier={m.crisis_tier} />}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs text-text-muted">
                      {formatShortDate(m.created_at)} · {m.user_id.slice(0, 8)}...
                    </p>
                    <p className="font-sans text-sm text-text-primary mt-1 line-clamp-3">
                      {m.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminSection>

        {/* Recent activity */}
        <AdminSection
          title="Recent Activity"
          count={recentActivity.length}
          color="text-iris-400"
        >
          {recentActivity.length === 0 ? (
            <EmptyState text="No recent activity." />
          ) : (
            <div className="space-y-1">
              {recentActivity.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-1 transition-colors"
                >
                  <span
                    className={[
                      'w-2 h-2 rounded-full flex-shrink-0',
                      m.role === 'user' ? 'bg-iris-500' : 'bg-gold-500',
                    ].join(' ')}
                  />
                  <p className="font-sans text-xs text-text-muted w-24 flex-shrink-0">
                    {formatShortDate(m.created_at)}
                  </p>
                  <p className="font-sans text-xs text-text-muted w-12 flex-shrink-0">
                    {m.role}
                  </p>
                  <p className="font-sans text-sm text-text-secondary truncate flex-1">
                    {m.content.slice(0, 120)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AdminSection>
      </main>
    </div>
  )
}

function AdminSection({
  title,
  count,
  color,
  children,
}: {
  title: string
  count: number
  color: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-sans font-semibold text-sm text-text-primary">
          {title}
        </h2>
        <span className={`font-sans text-xs font-medium ${color}`}>
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

function TierBadge({ tier }: { tier: number }) {
  const color =
    tier === 1
      ? 'bg-error/20 text-error border-error/30'
      : tier === 2
        ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
        : 'bg-iris-600/20 text-iris-400 border-iris-600/30'

  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border font-sans text-xs font-bold flex-shrink-0 ${color}`}
    >
      T{tier}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="font-sans text-sm text-text-muted py-4 text-center">{text}</p>
  )
}
