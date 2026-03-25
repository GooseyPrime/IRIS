'use client'

import { useEffect, useState } from 'react'
import {
  computeSobrietyTime,
  getCurrentMilestone,
  getNextMilestone,
  type Milestone,
  type SobrietyTime,
} from '@/lib/sobriety'

export interface SobrietyCounterState {
  time: SobrietyTime
  currentMilestone: Milestone | null
  nextMilestone: Milestone | null
  /** True until the first tick resolves (avoids hydration mismatch) */
  isReady: boolean
}

const ZERO_TIME: SobrietyTime = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalSeconds: 0,
}

/**
 * Live-ticking sobriety counter.
 * Pass `null` when the user has no sobriety date — returns zero state without ticking.
 * Updates every second via setInterval.
 */
export function useSobrietyCounter(
  sobrietyDateIso: string | null,
): SobrietyCounterState {
  const [state, setState] = useState<SobrietyCounterState>({
    time: ZERO_TIME,
    currentMilestone: null,
    nextMilestone: null,
    isReady: false,
  })

  useEffect(() => {
    if (!sobrietyDateIso) {
      setState({
        time: ZERO_TIME,
        currentMilestone: null,
        nextMilestone: null,
        isReady: true,
      })
      return
    }

    function tick() {
      if (!sobrietyDateIso) return
      const time = computeSobrietyTime(sobrietyDateIso)
      setState({
        time,
        currentMilestone: getCurrentMilestone(time.days),
        nextMilestone: getNextMilestone(time.days),
        isReady: true,
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [sobrietyDateIso])

  return state
}
