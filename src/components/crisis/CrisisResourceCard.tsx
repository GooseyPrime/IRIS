/**
 * Standalone crisis resource card with tap-to-call/text affordances.
 * Can be rendered inside CrisisAlert, on a resources page, or in the dashboard.
 *
 * Resources are NEVER AI-generated — they are hardcoded and clinically reviewed.
 */

const CRISIS_RESOURCES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Call or text — free, confidential, 24/7',
    action: 'Call 988',
    href: 'tel:988',
    icon: '\u{1F4DE}',
  },
  {
    name: 'Crisis Text Line',
    description: 'Text HOME to 741741',
    action: 'Text HOME',
    href: 'sms:741741&body=HOME',
    icon: '\u{1F4F1}',
  },
  {
    name: 'SAMHSA Helpline',
    description: '1-800-662-4357 — treatment referrals & info',
    action: 'Call SAMHSA',
    href: 'tel:18006624357',
    icon: '\u{1F4DE}',
  },
  {
    name: 'Emergency Services',
    description: 'Immediate danger — call 911',
    action: 'Call 911',
    href: 'tel:911',
    icon: '\u{1F6A8}',
  },
] as const

interface CrisisResourceCardProps {
  variant?: 'urgent' | 'supportive' | 'subtle'
}

export function CrisisResourceCard({ variant = 'urgent' }: CrisisResourceCardProps) {
  const borderColor =
    variant === 'urgent'
      ? 'border-error/40'
      : variant === 'supportive'
        ? 'border-gold-500/40'
        : 'border-iris-600/30'

  const bgColor =
    variant === 'urgent'
      ? 'bg-error/5'
      : variant === 'supportive'
        ? 'bg-gold-500/5'
        : 'bg-surface-1'

  const headingColor =
    variant === 'urgent'
      ? 'text-error'
      : variant === 'supportive'
        ? 'text-gold-400'
        : 'text-text-primary'

  return (
    <div
      className={`rounded-2xl border ${borderColor} ${bgColor} p-4`}
      role="region"
      aria-label="Crisis resources"
    >
      <p className={`font-sans text-xs font-semibold uppercase tracking-wider ${headingColor} mb-3`}>
        You are not alone
      </p>

      <div className="grid grid-cols-1 gap-2">
        {CRISIS_RESOURCES.map((resource) => (
          <a
            key={resource.name}
            href={resource.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-iris-900/20 bg-surface-0/50 hover:bg-surface-2 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
          >
            <span className="text-lg flex-shrink-0" aria-hidden="true">
              {resource.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-medium text-text-primary truncate">
                {resource.name}
              </p>
              <p className="font-sans text-xs text-text-muted truncate">
                {resource.description}
              </p>
            </div>
            <span
              className={[
                'font-sans text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 transition-colors',
                variant === 'urgent'
                  ? 'bg-error/15 text-error group-hover:bg-error/25'
                  : variant === 'supportive'
                    ? 'bg-gold-500/15 text-gold-400 group-hover:bg-gold-500/25'
                    : 'bg-iris-600/15 text-iris-400 group-hover:bg-iris-600/25',
              ].join(' ')}
            >
              {resource.action}
            </span>
          </a>
        ))}
      </div>

      <p className="font-sans text-[0.6rem] text-text-muted mt-3 text-center">
        All lines are free, confidential, and available 24/7.
      </p>
    </div>
  )
}
