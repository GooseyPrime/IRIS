import 'server-only'

import { createClient as createSupabaseClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export interface AuthenticatedRequestContext {
  supabase: SupabaseClient<Database>
  user: User
  authSource: 'cookie' | 'bearer'
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization) {
    return null
  }

  const [scheme, token] = authorization.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null
  }

  return token.trim()
}

export async function getAuthenticatedRequestContext(
  request: Request,
): Promise<AuthenticatedRequestContext | null> {
  const cookieClient = await createServerClient()
  const {
    data: { user: cookieUser },
  } = await cookieClient.auth.getUser()

  if (cookieUser) {
    return {
      supabase: cookieClient,
      user: cookieUser,
      authSource: 'cookie',
    }
  }

  const token = getBearerToken(request)
  if (!token) {
    return null
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return null
  }

  const bearerClient = createSupabaseClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const {
    data: { user: bearerUser },
  } = await bearerClient.auth.getUser()

  if (!bearerUser) {
    return null
  }

  return {
    supabase: bearerClient,
    user: bearerUser,
    authSource: 'bearer',
  }
}
