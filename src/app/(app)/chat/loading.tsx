export default function ChatLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-surface-0">
      <div className="w-12 h-12 rounded-full bg-iris-600/20 flex items-center justify-center mb-4">
        <span
          className="w-5 h-5 rounded-full border-2 border-iris-400 border-t-transparent animate-spin"
          aria-hidden="true"
        />
      </div>
      <p className="font-sans text-sm text-text-muted">
        Starting a new session&hellip;
      </p>
    </div>
  )
}
