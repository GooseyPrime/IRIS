import type {
  MobileChatUserContext,
  MobileCheckoutResponse,
  MobileSubscriptionStatusResponse,
} from './types'
import { env } from './env'

const JSON_HEADERS = {
  'Content-Type': 'application/json',
} as const

function withAuthHeaders(accessToken: string, platform: 'ios' | 'android') {
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${accessToken}`,
    'x-mobile-platform': platform,
  } as const
}

export async function fetchSubscriptionStatus(
  accessToken: string,
): Promise<MobileSubscriptionStatusResponse> {
  const response = await fetch(`${env.apiUrl}/api/mobile/subscription/status`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to load subscription status (${response.status})`)
  }

  return (await response.json()) as MobileSubscriptionStatusResponse
}

export async function createSubscriptionCheckout(
  accessToken: string,
  platform: 'ios' | 'android',
): Promise<MobileCheckoutResponse> {
  const response = await fetch(`${env.apiUrl}/api/mobile/subscription/checkout`, {
    method: 'POST',
    headers: withAuthHeaders(accessToken, platform),
    body: JSON.stringify({
      platform,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const errorMessage =
      typeof errorBody.error === 'string'
        ? errorBody.error
        : `Failed to create checkout session (${response.status})`
    throw new Error(errorMessage)
  }

  return (await response.json()) as MobileCheckoutResponse
}

export async function sendChatMessage(
  accessToken: string,
  platform: 'ios' | 'android',
  conversationId: string,
  messageText: string,
  userContext: MobileChatUserContext,
): Promise<string> {
  const response = await fetch(`${env.apiUrl}/api/mobile/chat`, {
    method: 'POST',
    headers: withAuthHeaders(accessToken, platform),
    body: JSON.stringify({
      conversationId,
      message: messageText,
      userContext,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    if (
      typeof errorBody.code === 'string' &&
      errorBody.code === 'MOBILE_SUBSCRIPTION_REQUIRED'
    ) {
      throw new Error('MOBILE_SUBSCRIPTION_REQUIRED')
    }

    throw new Error(
      typeof errorBody.error === 'string'
        ? errorBody.error
        : `Chat request failed (${response.status})`,
    )
  }

  const body = (await response.json()) as { reply?: string }
  if (typeof body.reply !== 'string' || body.reply.trim().length === 0) {
    throw new Error('Received empty AI response.')
  }
  return body.reply
}
