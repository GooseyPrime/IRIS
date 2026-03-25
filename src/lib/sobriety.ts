/**
 * Pure sobriety-time utilities — no React, no side-effects.
 * All functions are deterministic given a Date argument so they can
 * be tested in isolation and called safely inside useEffect intervals.
 */

export interface SobrietyTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** Total elapsed seconds since sobriety date (always >= 0) */
  totalSeconds: number
}

export interface Milestone {
  label: string
  /** Days threshold at which this milestone was reached */
  days: number
}

/** Ordered list of sobriety milestones by day threshold. */
const MILESTONES: readonly Milestone[] = [
  { label: '24 hours', days: 1 },
  { label: '1 week', days: 7 },
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
  { label: '6 months', days: 183 },
  { label: '1 year', days: 365 },
  { label: '18 months', days: 548 },
  { label: '2 years', days: 730 },
  { label: '3 years', days: 1095 },
  { label: '4 years', days: 1460 },
  { label: '5 years', days: 1825 },
]

/**
 * Compute how much time has elapsed since `sobrietyDate`.
 * Returns zero-values if the date is in the future (edge case: relapse today).
 */
export function computeSobrietyTime(
  sobrietyDateIso: string,
  now: Date = new Date(),
): SobrietyTime {
  const start = new Date(sobrietyDateIso)
  const elapsedMs = Math.max(0, now.getTime() - start.getTime())
  const totalSeconds = Math.floor(elapsedMs / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, totalSeconds }
}

/**
 * Returns the most recently reached milestone for a given day count,
 * or null if the user hasn't yet hit the 24-hour mark.
 */
export function getCurrentMilestone(days: number): Milestone | null {
  let current: Milestone | null = null
  for (const m of MILESTONES) {
    if (days >= m.days) {
      current = m
    } else {
      break
    }
  }
  return current
}

/**
 * Returns the next upcoming milestone, or null if all milestones are passed.
 */
export function getNextMilestone(days: number): Milestone | null {
  for (const m of MILESTONES) {
    if (days < m.days) return m
  }
  return null
}

/**
 * Format a two-digit zero-padded string (e.g. 7 → "07").
 */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}
