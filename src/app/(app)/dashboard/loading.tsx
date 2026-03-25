import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function DashboardLoading() {
  return (
    <DashboardShell>
      {/* Counter skeleton */}
      <div className="bg-surface-1 rounded-3xl border border-iris-900/30 px-6 py-10 mb-8 flex flex-col items-center gap-6 animate-pulse">
        <div className="h-32 w-52 rounded-2xl bg-iris-900/30" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-14 rounded-lg bg-iris-900/20" />
          <div className="h-6 w-2 rounded bg-iris-900/20" />
          <div className="h-8 w-14 rounded-lg bg-iris-900/20" />
          <div className="h-6 w-2 rounded bg-iris-900/20" />
          <div className="h-8 w-14 rounded-lg bg-iris-900/20" />
        </div>
        <div className="h-4 w-40 rounded-full bg-iris-900/20" />
      </div>

      {/* Card skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-iris-900/30 bg-surface-1 animate-pulse"
          >
            <div className="h-4 w-28 rounded bg-iris-900/30 mb-3" />
            <div className="h-3 w-40 rounded bg-iris-900/20" />
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
