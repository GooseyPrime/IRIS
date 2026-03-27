import { LogoutButton } from '@/components/auth/LogoutButton'

interface ChatShellProps {
  children: React.ReactNode
  displayName: string | null
  showLogout?: boolean
}

export function ChatShell({ children, displayName, showLogout = true }: ChatShellProps) {
  return (
    <div className="flex flex-col h-screen">
      <nav className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="font-sans text-sm text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded"
            aria-label="Back to dashboard"
          >
            &larr;
          </a>
          <span className="font-serif font-light text-lg tracking-tight text-zinc-100">
            IRIS
          </span>
        </div>
        <div className="flex items-center gap-3">
          {displayName && (
            <span className="font-sans text-xs text-zinc-400">
              {displayName}
            </span>
          )}
          {showLogout && (
            <LogoutButton
              label="Log out"
              className="font-sans text-xs text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded disabled:opacity-60"
            />
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden bg-black/40 backdrop-blur-xl border-x border-white/5">
        {children}
      </div>
    </div>
  )
}
