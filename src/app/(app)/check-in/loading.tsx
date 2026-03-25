import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function CheckInLoading() {
  return (
    <DashboardShell>
      <div className="max-w-lg mx-auto flex flex-col gap-6 animate-pulse">
        {/* Heading skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 rounded-full bg-iris-900/30" />
          <div className="h-8 w-56 rounded-lg bg-iris-900/30" />
          <div className="h-4 w-72 rounded bg-iris-900/20" />
        </div>

        {/* Mood row skeleton */}
        <div className="bg-surface-1 rounded-2xl border border-iris-900/30 p-5 flex flex-col gap-3">
          <div className="h-4 w-32 rounded bg-iris-900/20" />
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 h-14 rounded-xl bg-iris-900/20" />
            ))}
          </div>
        </div>

        {/* Pledge skeleton */}
        <div className="bg-surface-1 rounded-2xl border border-iris-900/30 p-5 flex flex-col gap-3">
          <div className="h-4 w-48 rounded bg-iris-900/20" />
          <div className="flex gap-3">
            <div className="flex-1 h-14 rounded-xl bg-iris-900/20" />
            <div className="flex-1 h-14 rounded-xl bg-iris-900/20" />
          </div>
        </div>

        {/* Emotions skeleton */}
        <div className="bg-surface-1 rounded-2xl border border-iris-900/30 p-5 flex flex-col gap-3">
          <div className="h-4 w-36 rounded bg-iris-900/20" />
          <div className="flex flex-wrap gap-2">
            {[80, 64, 96, 72, 60, 88, 76].map((w, i) => (
              <div
                key={i}
                className="h-8 rounded-full bg-iris-900/20"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-12 w-full rounded-xl bg-iris-900/30" />
      </div>
    </DashboardShell>
  )
}
