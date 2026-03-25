interface ChatShellProps {
  children: React.ReactNode
  displayName: string | null
}

export function ChatShell({ children, displayName }: ChatShellProps) {
  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {/* Top nav */}
      <nav className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-iris-900/20 bg-surface-0/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="font-sans text-sm text-text-muted hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 rounded"
            aria-label="Back to dashboard"
          >
            ←
          </a>
          <span className="font-serif font-light text-lg tracking-tight text-text-primary">
            IRIS
          </span>
        </div>
        {displayName && (
          <span className="font-sans text-xs text-text-muted">
            {displayName}
          </span>
        )}
      </nav>

      {/* Chat body — fills remaining height */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
