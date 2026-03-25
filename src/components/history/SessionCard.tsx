import Link from 'next/link'
import type { SessionPreview } from '@/types'
import { formatRelativeDate } from '@/lib/format-date'

interface SessionCardProps {
  session: SessionPreview
}

export function SessionCard({ session }: SessionCardProps) {
  const displayTitle =
    session.title ??
    session.lastMessagePreview ??
    'Untitled conversation'

  return (
    <Link
      href={`/chat/${session.id}`}
      className="flex flex-col gap-2 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl hover:border-white/20 hover:bg-black/50 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-sans text-sm font-medium text-zinc-100 line-clamp-2 flex-1">
          {displayTitle}
        </p>
        <span className="font-sans text-[0.65rem] text-zinc-400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {formatRelativeDate(session.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-sans text-xs text-zinc-400 flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 3.5C2 2.67 2.67 2 3.5 2h5C9.33 2 10 2.67 10 3.5v4c0 .83-.67 1.5-1.5 1.5H5L3 11V9h-.5C1.67 9 1 8.33 1 7.5v-4Z"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
        </span>

        {session.endedAt !== null && (
          <span className="font-sans text-[0.6rem] uppercase tracking-wider text-zinc-400">
            Ended
          </span>
        )}
      </div>
    </Link>
  )
}
