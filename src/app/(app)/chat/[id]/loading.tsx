export default function ChatSessionLoading() {
  return (
    <div className="flex flex-col h-screen bg-surface-0">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-iris-900/20">
        <div className="w-12 h-4 rounded bg-surface-2 animate-pulse" />
        <div className="w-10 h-5 rounded bg-surface-2 animate-pulse" />
        <div className="w-12" />
      </div>

      {/* Message area skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-surface-1 animate-pulse" />
        <div className="w-40 h-5 rounded bg-surface-1 animate-pulse" />
        <div className="w-56 h-4 rounded bg-surface-1 animate-pulse" />
      </div>

      {/* Input skeleton */}
      <div className="border-t border-iris-900/20 px-4 py-3">
        <div className="flex items-end gap-3 max-w-2xl mx-auto">
          <div className="flex-1 h-11 rounded-xl bg-surface-2 animate-pulse" />
          <div className="w-10 h-10 rounded-xl bg-surface-2 animate-pulse flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}
