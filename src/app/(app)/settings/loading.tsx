import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function SettingsLoading() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 animate-pulse">
        <div>
          <div className="h-7 w-32 bg-iris-900/30 rounded-lg" />
          <div className="h-4 w-56 bg-iris-900/20 rounded mt-2" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-iris-900/20 rounded" />
            <div className="h-12 w-full bg-iris-900/30 rounded-xl" />
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
