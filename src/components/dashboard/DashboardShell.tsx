interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/30 backdrop-blur-md">
        <span className="font-serif font-light text-xl tracking-tight text-zinc-100">
          IRIS
        </span>
        <div className="flex items-center gap-4">
          <a
            href="/settings"
            className="font-sans text-sm text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
          >
            Settings
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
