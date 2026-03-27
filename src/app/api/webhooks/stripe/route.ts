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

      if (invoice.subscription) {
        const supabase = createServiceRoleClient()
        if (supabase) {
          const subscriptionId = typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id

          const customerId = typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

          const userId = typeof invoice.metadata.userId === 'string'
            ? invoice.metadata.userId
            : typeof invoice.parent?.subscription_details?.metadata.userId === 'string'
              ? invoice.parent.subscription_details.metadata.userId
              : undefined

          if (userId) {
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
            const productId = invoice.lines.data[0]?.pricing?.price_details?.price ?? 'price_1TFiZiJF6bibA8neZPyI4H3c'

            await upsertMobileSubscription(supabase, {
              userId,
              provider: 'stripe',
              platform: invoice.metadata.platform === 'android' ? 'android' : 'ios',
              productId,
              externalCustomerId: customerId,
              externalSubscriptionId: subscriptionId,
              status: 'active',
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: false,
              latestEventAt: eventAt,
              rawPayload: invoice as unknown as Record<string, unknown>,
            })

            await insertMobileSubscriptionEvent(supabase, {
              userId,
              provider: 'stripe',
              platform: invoice.metadata.platform === 'android' ? 'android' : 'ios',
              eventType: event.type,
              externalSubscriptionId: subscriptionId,
              status: 'active',
              eventAt,
              payload: invoice as unknown as Record<string, unknown>,
            })
          }
        }
      }

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
      const currentPeriodStart = typeof subscription.current_period_start === 'number'
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : undefined
      const currentPeriodEnd = typeof subscription.current_period_end === 'number'
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : undefined
      const eventAt = typeof event.created === 'number'
        ? new Date(event.created * 1000).toISOString()
        : new Date().toISOString()
      const productId = resolveStripeProductId(subscription)

      await upsertMobileSubscription(supabase, {
        userId,
        provider: 'stripe',
        platform: subscription.metadata.platform === 'android' ? 'android' : 'ios',
        productId,
        externalCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
        externalSubscriptionId: subscription.id,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        latestEventAt: eventAt,
        rawPayload: subscription as unknown as Record<string, unknown>,
      })

      await insertMobileSubscriptionEvent(supabase, {
        userId,
        provider: 'stripe',
        platform: subscription.metadata.platform === 'android' ? 'android' : 'ios',
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
