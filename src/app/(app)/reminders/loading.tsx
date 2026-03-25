export default function RemindersLoading() {
  return (
    <div className="min-h-screen bg-surface-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-iris-900/20">
        <div className="w-12 h-4 rounded bg-surface-2 animate-pulse" />
        <div className="w-20 h-5 rounded bg-surface-2 animate-pulse" />
        <div className="w-12" />
      </div>
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-40 h-4 rounded bg-surface-1 animate-pulse" />
          <div className="w-56 h-6 rounded bg-surface-1 animate-pulse" />
          <div className="w-64 h-4 rounded bg-surface-1 animate-pulse" />
        </div>
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="h-20 rounded-xl bg-surface-1 animate-pulse" />
          <div className="h-20 rounded-xl bg-surface-1 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
