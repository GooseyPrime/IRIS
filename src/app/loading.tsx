export default function RootLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-surface-0">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-iris-900 border-t-iris-500 animate-spin"
          aria-label="Loading"
          role="status"
        />
        <p className="font-sans text-sm text-text-muted tracking-wide">
          Loading…
        </p>
      </div>
    </div>
  )
}
