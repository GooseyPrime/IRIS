interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Top nav strip */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-iris-900/20 bg-surface-0/90 backdrop-blur-sm">
        <span className="font-serif font-light text-xl tracking-tight text-text-primary">
          IRIS
        </span>
        <div className="flex items-center gap-4">
          <a
            href="/settings"
            className="font-sans text-sm text-text-muted hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 rounded"
          >
            Settings
          </a>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-10">
        {children}
      </main>
    </div>
  )
}
