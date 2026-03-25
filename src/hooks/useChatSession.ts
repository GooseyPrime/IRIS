'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useCallback } from 'react'
import {
  detectCrisis,
  CRISIS_RESPONSES,
  type CrisisTier,
} from '@/lib/crisis-detection'

interface UserContext {
  name: string
  daysSober: number
  tone: string
  triggers: string[]
}

interface CrisisState {
  tier: CrisisTier
  response: string
}

export function useChatSession(
  sessionId: string,
  userContext?: UserContext,
) {
  const [input, setInput] = useState('')
  const [crisisState, setCrisisState] = useState<CrisisState | null>(null)

  const { messages, sendMessage, status, stop, error, setMessages } =
    useChat({
      id: sessionId,
      onError: (err) => {
        console.error('Chat error:', err)
      },
    })

  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || status !== 'ready') return

      const crisisTier = detectCrisis(trimmed)

      if (crisisTier !== null) {
        setCrisisState({
          tier: crisisTier,
          response: CRISIS_RESPONSES[crisisTier],
        })

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'user' as const,
            parts: [{ type: 'text' as const, text: trimmed }],
          },
          {
            id: crypto.randomUUID(),
            role: 'assistant' as const,
            parts: [
              {
                type: 'text' as const,
                text: CRISIS_RESPONSES[crisisTier],
              },
            ],
          },
        ])
        setInput('')
        return
      }

      setCrisisState(null)
      await sendMessage(
        { text: trimmed },
        { body: { id: sessionId, userContext } },
      )
      setInput('')
    },
    [
      input,
      sendMessage,
      sessionId,
      userContext,
      status,
      setMessages,
    ],
  )

  const dismissCrisis = useCallback(() => {
    setCrisisState(null)
  }, [])

  return {
    messages,
    status,
    error,
    input,
    setInput,
    handleSend,
    stop,
    crisisState,
    dismissCrisis,
  }
}
