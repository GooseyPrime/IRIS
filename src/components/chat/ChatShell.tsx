'use client'

import { useChatSession } from '@/hooks/useChatSession'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { CrisisBanner } from '@/components/chat/CrisisBanner'

interface UserContext {
  name: string
  daysSober: number
  tone: string
  triggers: string[]
}

interface ChatShellProps {
  sessionId: string
  userContext?: UserContext | undefined
}

export function ChatShell({ sessionId, userContext }: ChatShellProps) {
  const {
    messages,
    status,
    input,
    setInput,
    handleSend,
    stop,
    crisisState,
    dismissCrisis,
  } = useChatSession(sessionId, userContext)

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} status={status} />

      {crisisState !== null && (
        <CrisisBanner
          tier={crisisState.tier}
          onDismiss={dismissCrisis}
        />
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSend}
        onStop={stop}
        status={status}
      />
    </div>
  )
}
