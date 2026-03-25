const MINUTE = 60
const HOUR = 3600
const DAY = 86400

/**
 * Formats a date string as a human-friendly relative time.
 * Examples: "Just now", "5 min ago", "2 hours ago", "Yesterday", "Mar 15"
 */
export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSeconds < MINUTE) return 'Just now'
  if (diffSeconds < HOUR) {
    const mins = Math.floor(diffSeconds / MINUTE)
    return `${mins} min ago`
  }
  if (diffSeconds < DAY) {
    const hours = Math.floor(diffSeconds / HOUR)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diffSeconds < DAY * 2) return 'Yesterday'
  if (diffSeconds < DAY * 7) {
    const days = Math.floor(diffSeconds / DAY)
    return `${days} days ago`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Formats a date string as a short date for display.
 * Example: "Mar 25, 2026"
 */
export function formatShortDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
