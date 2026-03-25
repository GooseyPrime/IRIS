import { ChatShell } from '@/components/chat/ChatShell'

export default function ChatLoading() {
  return (
    <ChatShell displayName={null}>
      {/* Message area skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center animate-pulse">
        <div className="w-12 h-12 rounded-full bg-iris-900/40" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-40 rounded-lg bg-iris-900/30" />
          <div className="h-4 w-56 rounded bg-iris-900/20" />
        </div>
      </div>

      {/* Input skeleton */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-iris-900/20">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <div className="flex-1 h-12 rounded-2xl bg-iris-900/30 animate-pulse" />
          <div className="w-10 h-10 rounded-xl bg-iris-900/30 animate-pulse" />
        </div>
      </div>
    </ChatShell>
  )
}
