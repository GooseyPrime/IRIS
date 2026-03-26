import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role for webhook writes (bypasses RLS)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey)
}

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
        const supabase = getServiceClient()
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
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      console.log(`[stripe webhook] customer.subscription.deleted — id=${subscription.id}`)
      break
    }

    default:
      console.log(`[stripe webhook] unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
