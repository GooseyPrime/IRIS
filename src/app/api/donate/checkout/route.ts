import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const TIERS = {
  spark: { mode: 'subscription' as const, amount: 1000, interval: 'month' as const, label: 'Spark — $10/mo' },
  ember: { mode: 'subscription' as const, amount: 2500, interval: 'month' as const, label: 'Ember — $25/mo' },
  flame: { mode: 'subscription' as const, amount: 5000, interval: 'month' as const, label: 'Flame — $50/mo' },
  beacon: { mode: 'subscription' as const, amount: 10000, interval: 'month' as const, label: 'Beacon — $100/mo' },
  lighthouse: { mode: 'payment' as const, amount: 120000, label: 'Lighthouse — $1,200 one-time' },
} as const

type TierKey = keyof typeof TIERS

const CheckoutRequestSchema = z.object({
  tier: z.enum(['spark', 'ember', 'flame', 'beacon', 'lighthouse']),
  recipientEmail: z.string().email().optional(),
})

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
  })

  const body: unknown = await request.json()
  const parsed = CheckoutRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join('; ') },
      { status: 400 },
    )
  }

  const { tier, recipientEmail } = parsed.data
  const tierConfig = TIERS[tier as TierKey]

  const origin = request.headers.get('origin') ?? 'http://localhost:3000'

  const metadata: Record<string, string> = { tier }
  if (recipientEmail) {
    metadata.recipientEmail = recipientEmail
  }

  try {
    if (tierConfig.mode === 'subscription') {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: tierConfig.label },
              unit_amount: tierConfig.amount,
              recurring: { interval: tierConfig.interval },
            },
            quantity: 1,
          },
        ],
        metadata,
        success_url: `${origin}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/donate`,
      })

      return NextResponse.json({ url: session.url })
    }

    // One-time payment (lighthouse)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: tierConfig.label },
            unit_amount: tierConfig.amount,
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${origin}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[donate/checkout] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
