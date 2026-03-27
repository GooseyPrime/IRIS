import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { MOBILE_SUBSCRIPTION_STATUS } from '@/types'

type MobileSubscriptionRow = Database['public']['Tables']['mobile_subscriptions']['Row']
type MobileSubscriptionInsert = Database['public']['Tables']['mobile_subscriptions']['Insert']
type MobileSubscriptionEventInsert =
  Database['public']['Tables']['mobile_subscription_events']['Insert']
type JsonValue = Database['public']['Tables']['mobile_subscriptions']['Row']['raw_payload']

export interface EntitlementSnapshot {
  hasMobileAiAccess: boolean
  subscription: MobileSubscriptionRow | null
}

export interface UpsertMobileSubscriptionInput {
  userId: string
  provider: MobileSubscriptionInsert['provider']
  platform: MobileSubscriptionInsert['platform']
  productId: string
  externalCustomerId?: string
  externalSubscriptionId: string
  status: MobileSubscriptionInsert['status']
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  latestEventAt?: string
  rawPayload?: Record<string, unknown>
}

export interface CreateMobileSubscriptionEventInput {
  userId?: string
  provider: MobileSubscriptionEventInsert['provider']
  platform: MobileSubscriptionEventInsert['platform']
  eventType: string
  externalSubscriptionId?: string
  status?: MobileSubscriptionEventInsert['status']
  eventAt?: string
  payload?: Record<string, unknown>
}

function toJsonValue(value: Record<string, unknown> | undefined): JsonValue {
  if (!value) {
    return {}
  }

  try {
    return JSON.parse(JSON.stringify(value)) as JsonValue
  } catch {
    return {}
  }
}

export async function getLatestMobileSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from('mobile_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('current_period_end', { ascending: false, nullsFirst: false })
    .order('latest_event_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as MobileSubscriptionRow | null
}

export function hasActiveMobileEntitlement(
  subscription: MobileSubscriptionRow | null,
  now = new Date(),
) {
  if (!subscription) {
    return false
  }

  const activeStatuses = new Set<MobileSubscriptionRow['status']>([
    MOBILE_SUBSCRIPTION_STATUS.ACTIVE,
    MOBILE_SUBSCRIPTION_STATUS.TRIALING,
    MOBILE_SUBSCRIPTION_STATUS.GRACE_PERIOD,
  ])

  if (!activeStatuses.has(subscription.status)) {
    return false
  }

  if (!subscription.current_period_end) {
    return true
  }

  const currentPeriodEnd = new Date(subscription.current_period_end)
  return Number.isNaN(currentPeriodEnd.getTime()) ? false : currentPeriodEnd > now
}

export async function getMobileEntitlementSnapshot(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<EntitlementSnapshot> {
  const subscription = await getLatestMobileSubscription(supabase, userId)
  return {
    hasMobileAiAccess: hasActiveMobileEntitlement(subscription),
    subscription,
  }
}

export async function upsertMobileSubscription(
  supabase: SupabaseClient<Database>,
  input: UpsertMobileSubscriptionInput,
) {
  const insertPayload: MobileSubscriptionInsert = {
    user_id: input.userId,
    provider: input.provider,
    platform: input.platform,
    product_id: input.productId,
    external_customer_id: input.externalCustomerId ?? null,
    external_subscription_id: input.externalSubscriptionId,
    status: input.status,
    current_period_start: input.currentPeriodStart ?? null,
    current_period_end: input.currentPeriodEnd ?? null,
    cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
    latest_event_at: input.latestEventAt ?? new Date().toISOString(),
    raw_payload: toJsonValue(input.rawPayload),
  }

  const { error } = await supabase
    .from('mobile_subscriptions')
    .upsert(insertPayload, {
      onConflict: 'provider,external_subscription_id',
    })

  if (error) {
    throw error
  }
}

export async function insertMobileSubscriptionEvent(
  supabase: SupabaseClient<Database>,
  input: CreateMobileSubscriptionEventInput,
) {
  const eventPayload: MobileSubscriptionEventInsert = {
    user_id: input.userId ?? null,
    provider: input.provider,
    platform: input.platform,
    event_type: input.eventType,
    external_subscription_id: input.externalSubscriptionId ?? null,
    status: input.status ?? null,
    event_at: input.eventAt ?? new Date().toISOString(),
    payload: toJsonValue(input.payload),
  }

  const { error } = await supabase
    .from('mobile_subscription_events')
    .insert(eventPayload)

  if (error) {
    throw error
  }
}
