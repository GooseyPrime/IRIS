'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'iris_reminder_prefs'

export interface ReminderPrefs {
  morningEnabled: boolean
  morningTime: string
  eveningEnabled: boolean
  eveningTime: string
}

const DEFAULT_PREFS: ReminderPrefs = {
  morningEnabled: false,
  morningTime: '08:00',
  eveningEnabled: false,
  eveningTime: '20:00',
}

function loadPrefs(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'morningEnabled' in parsed &&
      'eveningEnabled' in parsed
    ) {
      return parsed as ReminderPrefs
    }
  } catch {
    // corrupted — return defaults
  }
  return DEFAULT_PREFS
}

function savePrefs(prefs: ReminderPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // localStorage unavailable
  }
}

export type NotificationPermission = 'default' | 'granted' | 'denied'

export function useReminders() {
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_PREFS)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setPrefs(loadPrefs())
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission as NotificationPermission)
    }
    setMounted(true)
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied' as const
    const result = await Notification.requestPermission()
    setPermission(result as NotificationPermission)
    return result as NotificationPermission
  }, [])

  const updatePrefs = useCallback((update: Partial<ReminderPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...update }
      savePrefs(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (!mounted || permission !== 'granted') return

    const checkAndNotify = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      if (prefs.morningEnabled && currentTime === prefs.morningTime) {
        new Notification('IRIS — Good morning', {
          body: 'Start your day with intention. How are you feeling?',
          icon: '/favicon.ico',
          tag: 'iris-morning',
        })
      }

      if (prefs.eveningEnabled && currentTime === prefs.eveningTime) {
        new Notification('IRIS — Evening reflection', {
          body: 'Take a moment to check in. How was your day?',
          icon: '/favicon.ico',
          tag: 'iris-evening',
        })
      }
    }

    const interval = setInterval(checkAndNotify, 60_000)
    return () => clearInterval(interval)
  }, [mounted, permission, prefs])

  return { prefs, updatePrefs, permission, requestPermission, mounted }
}
