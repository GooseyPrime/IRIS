import Constants from 'expo-constants'

interface MobileExtra {
  apiUrl?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
}

function getExtra(): MobileExtra {
  const extra = Constants.expoConfig?.extra as MobileExtra | undefined
  return extra ?? {}
}

function requireString(value: unknown, keyName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing mobile app.json extra.${keyName} configuration.`)
  }
  return value
}

export const env = (() => {
  const extra = getExtra()
  return {
    apiUrl: requireString(extra.apiUrl, 'apiUrl'),
    supabaseUrl: requireString(extra.supabaseUrl, 'supabaseUrl'),
    supabaseAnonKey: requireString(extra.supabaseAnonKey, 'supabaseAnonKey'),
  } as const
})()
