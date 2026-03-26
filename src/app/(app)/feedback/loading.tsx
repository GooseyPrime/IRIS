import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default function FeedbackLoading() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 animate-pulse">
        <div>
          <div className="h-7 w-40 bg-iris-900/30 rounded-lg" />
          <div className="h-4 w-64 bg-iris-900/20 rounded mt-2" />
        </div>
        <div className="h-16 w-full bg-iris-900/30 rounded-xl" />
        <div className="h-12 w-full bg-iris-900/30 rounded-xl" />
        <div className="h-32 w-full bg-iris-900/30 rounded-xl" />
      </div>
    </DashboardShell>
  )
}
