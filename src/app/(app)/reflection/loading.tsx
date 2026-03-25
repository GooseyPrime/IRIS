export default function ReflectionLoading() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-iris-900/20">
        <div className="w-12 h-4 rounded bg-surface-2 animate-pulse" />
        <div className="w-10 h-5 rounded bg-surface-2 animate-pulse" />
        <div className="w-12" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        {/* Progress dots skeleton */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1.5 w-4 rounded-full bg-surface-2 animate-pulse"
            />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-6 rounded bg-surface-1 animate-pulse" />
          <div className="w-64 h-4 rounded bg-surface-1 animate-pulse" />
          <div className="flex gap-4 mt-4">
            <div className="w-24 h-24 rounded-2xl bg-surface-1 animate-pulse" />
            <div className="w-24 h-24 rounded-2xl bg-surface-1 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
