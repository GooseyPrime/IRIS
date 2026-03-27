import { NextResponse } from 'next/server'
import { getMobileEntitlementSnapshot } from '@/lib/mobile-subscriptions'
import { getAuthenticatedRequestContext } from '@/lib/supabase/request-context'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const context = await getAuthenticatedRequestContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const entitlement = await getMobileEntitlementSnapshot(context.supabase, context.user.id)

    return NextResponse.json({
      hasMobileAiAccess: entitlement.hasMobileAiAccess,
      subscription: entitlement.subscription
        ? {
            provider: entitlement.subscription.provider,
            platform: entitlement.subscription.platform,
            productId: entitlement.subscription.product_id,
            status: entitlement.subscription.status,
            currentPeriodEnd: entitlement.subscription.current_period_end,
            cancelAtPeriodEnd: entitlement.subscription.cancel_at_period_end,
            latestEventAt: entitlement.subscription.latest_event_at,
          }
        : null,
    })
  } catch (err) {
    console.error('[mobile/subscription/status] failed to fetch status:', err)
    return NextResponse.json(
      { error: 'Failed to load mobile subscription status.' },
      { status: 500 },
    )
  }
}
