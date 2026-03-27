import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import {
  insertMobileSubscriptionEvent,
  upsertMobileSubscription,
} from '@/lib/mobile-subscriptions'
import { MobileSubscriptionEventSchema } from '@/types'

export async function POST(request: Request) {
  const webhookSecret = process.env.MOBILE_SUBSCRIPTION_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Mobile subscription webhook is not configured.' },
      { status: 503 },
    )
  }

  const signature = request.headers.get('x-mobile-webhook-secret')
  if (signature !== webhookSecret) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = MobileSubscriptionEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join('; ') },
      { status: 400 },
    )
  }

  const serviceClient = createServiceRoleClient()
  if (!serviceClient) {
    return NextResponse.json(
      { error: 'Supabase service role client is not configured.' },
      { status: 503 },
    )
  }

  const payload = parsed.data

  try {
    await insertMobileSubscriptionEvent(serviceClient, {
      userId: payload.userId,
      provider: payload.provider,
      platform: payload.platform,
      eventType: payload.eventType,
      externalSubscriptionId: payload.externalSubscriptionId,
      status: payload.status,
      eventAt: payload.eventAt,
      payload: payload.payload,
    })

    if (payload.userId) {
      await upsertMobileSubscription(serviceClient, {
        userId: payload.userId,
        provider: payload.provider,
        platform: payload.platform,
        productId: payload.productId,
        externalCustomerId: payload.externalCustomerId,
        externalSubscriptionId: payload.externalSubscriptionId,
        status: payload.status,
        currentPeriodStart: payload.currentPeriodStart,
        currentPeriodEnd: payload.currentPeriodEnd,
        cancelAtPeriodEnd: payload.cancelAtPeriodEnd,
        latestEventAt: payload.eventAt,
        rawPayload: payload.payload,
      })
    }
  } catch (err) {
    console.error('[mobile/subscription/webhook] processing failed:', err)
    return NextResponse.json(
      { error: 'Failed to process mobile subscription webhook.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ received: true })
}
