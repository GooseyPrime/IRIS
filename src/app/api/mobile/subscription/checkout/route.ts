import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { MobileSubscriptionCheckoutSchema } from '@/types'
import { getAuthenticatedRequestContext } from '@/lib/supabase/request-context'

const MOBILE_STRIPE_PRICE_ID = 'price_1TFiZiJF6bibA8neZPyI4H3c'

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const context = await getAuthenticatedRequestContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = MobileSubscriptionCheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join('; ') },
      { status: 400 },
    )
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
  })

  const { platform, successUrl, cancelUrl } = parsed.data
  const origin = request.headers.get('origin') ?? 'http://localhost:3000'
  const resolvedSuccessUrl = successUrl ?? `${origin}/dashboard`
  const resolvedCancelUrl = cancelUrl ?? `${origin}/dashboard`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: MOBILE_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      client_reference_id: context.user.id,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // Required for zero-dollar invoices (for example, 100% off coupons).
      payment_method_collection: 'if_required',
      metadata: {
        source: 'mobile_subscription',
        platform,
        userId: context.user.id,
      },
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      subscription_data: {
        metadata: {
          source: 'mobile_subscription',
          platform,
          userId: context.user.id,
        },
      },
      ...(context.user.email ? { customer_email: context.user.email } : {}),
    })

    return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id })
  } catch (err) {
    console.error('[mobile/subscription/checkout] Stripe error:', err)
    return NextResponse.json(
      { error: 'Failed to create mobile subscription checkout session.' },
      { status: 500 },
    )
  }
}
