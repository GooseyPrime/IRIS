'use client'

import { useCallback, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { detectCrisis, CRISIS_RESPONSES } from '@/lib/crisis-detection'
import type { CrisisTier } from '@/lib/crisis-detection'

export interface UserContext {
  name: string
  daysSober: number
  tone: string
  triggers: string[]
}

export interface CrisisState {
  tier: CrisisTier
  response: string
}

export function useChatSession(sessionId: string, userContext?: UserContext) {
  const [input, setInput] = useState('')
  const [crisisState, setCrisisState] = useState<CrisisState | null>(null)

  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (err) => {
      console.error('[useChatSession] stream error:', err)
    },
  })

  /**
   * Send a message — runs crisis detection BEFORE the message reaches the AI.
   * Tier 1 and 2 crises inject a scripted response without sending to GPT-4o.
   * Tier 3 shows a gentle nudge but still routes to the AI.
   */
  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const tier = detectCrisis(trimmed)

      // Tier 1 / 2: scripted response only — AI never processes this message.
      // Fire-and-forget to persist the disclosure and create an audit record.
      if (tier === 1 || tier === 2) {
        setCrisisState({ tier, response: CRISIS_RESPONSES[tier] })
        setInput('')
        fetch('/api/crisis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, conversationId: sessionId, tier }),
        }).catch((err) => console.error('[useChatSession] crisis persist error:', err))
        return
      }

      clearError()

      // Tier 3: let it through but surface the nudge alongside normal stream
      if (tier === 3) {
        setCrisisState({ tier, response: CRISIS_RESPONSES[3] })
      }

      sendMessage(
        { text: trimmed },
        {
          body: {
            id: sessionId,
            userContext,
          },
        },
      )
      setInput('')
    },
    [sendMessage, sessionId, userContext, clearError],
  )

  const dismissCrisis = useCallback(() => setCrisisState(null), [])

  const isDisabled = status === 'submitted' || status === 'streaming'

  return {
    messages,
    status,
    error,
    isDisabled,
    input,
    setInput,
    handleSend,
    stop,
    crisisState,
    dismissCrisis,
  }
}
