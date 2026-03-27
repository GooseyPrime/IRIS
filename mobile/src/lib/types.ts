export interface MobileSubscriptionStatusResponse {
  hasMobileAiAccess: boolean
  subscription: {
    provider: 'stripe' | 'apple' | 'google'
    platform: 'ios' | 'android'
    productId: string
    status: 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired'
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    latestEventAt: string
  } | null
}

export interface MobileCheckoutResponse {
  checkoutUrl: string | null
  sessionId: string
}

export interface AuthResult {
  accessToken: string
  userId: string
}

export interface MobileChatUserContext {
  name: string
  daysSober: number
  tone: string
  triggers: string[]
}
