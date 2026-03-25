export default function OnboardingLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div
        className="w-10 h-10 rounded-full border-2 border-iris-900 border-t-iris-500 animate-spin"
        aria-label="Loading"
        role="status"
      />
      <p className="font-sans text-sm text-text-muted tracking-wide">Loading…</p>
    </div>
  )
}
