export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-iris-900/20">
        <div className="w-12 h-4 rounded bg-surface-2 animate-pulse" />
        <div className="w-24 h-5 rounded bg-surface-2 animate-pulse" />
        <div className="w-8 h-4 rounded bg-surface-2 animate-pulse" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-iris-900/30 bg-surface-1 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-3/4 h-4 rounded bg-surface-2 animate-pulse" />
              <div className="w-16 h-3 rounded bg-surface-2 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-3 rounded bg-surface-2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
