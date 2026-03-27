import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import {
  insertMobileSubscriptionEvent,
  upsertMobileSubscription,
} from '@/lib/mobile-subscriptions'

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
  })

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const tier = session.metadata?.tier ?? 'unknown'
      const recipientEmail = session.metadata?.recipientEmail

      console.log(`[stripe webhook] checkout.session.completed — tier=${tier}, amount=${session.amount_total}, recipientEmail=${recipientEmail ?? 'none'}`)

      // Handle targeted donation
      if (recipientEmail) {
        const supabase = createServiceRoleClient()
        if (supabase) {
          // Check if user already exists
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const matchedUser = existingUsers?.users?.find((u) => u.email === recipientEmail)

          if (matchedUser) {
            // Apply sponsorship immediately
            await supabase
              .from('user_profiles')
              .update({ account_tier: 'sponsor' })
              .eq('id', matchedUser.id)

            console.log(`[stripe webhook] Applied sponsorship to existing user: ${recipientEmail}`)
          } else {
            // Store pending sponsorship
            await supabase.from('pending_sponsorships').insert({
              recipient_email: recipientEmail,
              stripe_session_id: session.id,
              tier,
              applied: false,
            })

            console.log(`[stripe webhook] Stored pending sponsorship for: ${recipientEmail}`)
          }
        }
      }

      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      console.log(`[stripe webhook] invoice.paid — id=${invoice.id}, amount=${invoice.amount_paid}`)

      const subscriptionSource = invoice.parent?.subscription_details?.subscription
      if (!subscriptionSource) {
        break
      }

      const supabase = createServiceRoleClient()
      if (!supabase) {
        break
      }

      const subscriptionId = typeof subscriptionSource === 'string'
        ? subscriptionSource
        : subscriptionSource.id
      const customerId = typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id

      const invoiceMetadata = invoice.metadata ?? {}
      const subscriptionMetadata = invoice.parent?.subscription_details?.metadata ?? {}
      const userId = typeof invoiceMetadata.userId === 'string'
        ? invoiceMetadata.userId
        : typeof subscriptionMetadata.userId === 'string'
          ? subscriptionMetadata.userId
          : undefined

      if (!userId) {
        break
      }

      const periodStartUnix = invoice.lines.data[0]?.period?.start
      const periodEndUnix = invoice.lines.data[0]?.period?.end
      const currentPeriodStart = typeof periodStartUnix === 'number'
        ? new Date(periodStartUnix * 1000).toISOString()
        : undefined
      const currentPeriodEnd = typeof periodEndUnix === 'number'
        ? new Date(periodEndUnix * 1000).toISOString()
        : undefined
      const eventAt = typeof invoice.status_transitions.paid_at === 'number'
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
        : new Date().toISOString()
      const productId = resolveInvoiceProductId(invoice)
      const platform = resolveMobilePlatform(invoiceMetadata.platform)

      const upsertInput = {
        userId,
        provider: 'stripe' as const,
        platform,
        productId,
        externalSubscriptionId: subscriptionId,
        status: 'active' as const,
        cancelAtPeriodEnd: false,
        latestEventAt: eventAt,
        rawPayload: invoice as unknown as Record<string, unknown>,
        ...(customerId ? { externalCustomerId: customerId } : {}),
        ...(currentPeriodStart ? { currentPeriodStart } : {}),
        ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      }
      await upsertMobileSubscription(supabase, upsertInput)

      await insertMobileSubscriptionEvent(supabase, {
        userId,
        provider: 'stripe',
        platform,
        eventType: event.type,
        externalSubscriptionId: subscriptionId,
        status: 'active',
        eventAt,
        payload: invoice as unknown as Record<string, unknown>,
      })

      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`[stripe webhook] ${event.type} — id=${subscription.id}`)

      const supabase = createServiceRoleClient()
      if (!supabase) {
        break
      }

      const userId = typeof subscription.metadata.userId === 'string'
        ? subscription.metadata.userId
        : undefined

      if (!userId) {
        break
      }

      const status = mapStripeSubscriptionStatus(subscription.status)
      const currentPeriodStart = getSubscriptionPeriodStart(subscription)
      const currentPeriodEnd = getSubscriptionPeriodEnd(subscription)
      const eventAt = typeof event.created === 'number'
        ? new Date(event.created * 1000).toISOString()
        : new Date().toISOString()
      const productId = resolveStripeProductId(subscription)
      const customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id
      const platform = resolveMobilePlatform(subscription.metadata.platform)

      const upsertInput = {
        userId,
        provider: 'stripe' as const,
        platform,
        productId,
        externalSubscriptionId: subscription.id,
        status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        latestEventAt: eventAt,
        rawPayload: subscription as unknown as Record<string, unknown>,
        ...(customerId ? { externalCustomerId: customerId } : {}),
        ...(currentPeriodStart ? { currentPeriodStart } : {}),
        ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      }
      await upsertMobileSubscription(supabase, upsertInput)

      await insertMobileSubscriptionEvent(supabase, {
        userId,
        provider: 'stripe',
        platform,
        eventType: event.type,
        externalSubscriptionId: subscription.id,
        status,
        eventAt,
        payload: subscription as unknown as Record<string, unknown>,
      })

      break
    }

    default:
      console.log(`[stripe webhook] unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

function resolveStripeProductId(subscription: Stripe.Subscription): string {
  const price = subscription.items.data[0]?.price
  if (typeof price?.id === 'string') {
    return price.id
  }
  return 'price_1TFiZiJF6bibA8neZPyI4H3c'
}

function resolveInvoiceProductId(invoice: Stripe.Invoice): string {
  const candidate = invoice.lines.data[0]?.pricing?.price_details?.price
  return typeof candidate === 'string'
    ? candidate
    : 'price_1TFiZiJF6bibA8neZPyI4H3c'
}

function getSubscriptionPeriodStart(subscription: Stripe.Subscription): string | undefined {
  const periodStartUnix = subscription.items.data[0]?.current_period_start
  return typeof periodStartUnix === 'number'
    ? new Date(periodStartUnix * 1000).toISOString()
    : undefined
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | undefined {
  const periodEndUnix = subscription.items.data[0]?.current_period_end
  return typeof periodEndUnix === 'number'
    ? new Date(periodEndUnix * 1000).toISOString()
    : undefined
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired' {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'canceled':
      return 'canceled'
    case 'incomplete_expired':
      return 'expired'
    case 'incomplete':
    case 'paused':
      return 'grace_period'
  }
}

function resolveMobilePlatform(platformValue: string | undefined): 'ios' | 'android' {
  return platformValue === 'android' ? 'android' : 'ios'
}
