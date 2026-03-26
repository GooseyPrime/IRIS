export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-surface-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-iris-900/20">
        <div className="w-12 h-4 rounded bg-surface-2 animate-pulse" />
        <div className="w-16 h-5 rounded bg-surface-2 animate-pulse" />
        <div className="w-12" />
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <div className="w-32 h-4 rounded bg-surface-2 animate-pulse" />
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="h-16 rounded-xl bg-surface-1 animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
