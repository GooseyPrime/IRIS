'use client'

import { useEffect, useRef } from 'react'
import { useChatSession, type UserContext } from '@/hooks/useChatSession'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { CrisisAlert } from './CrisisAlert'

interface ChatInterfaceProps {
  sessionId: string
  userContext?: UserContext
}

export function ChatInterface({ sessionId, userContext }: ChatInterfaceProps) {
  const {
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
  } = useChatSession(sessionId, userContext)

  const bottomRef = useRef<HTMLDivElement>(null)
  const isStreaming = status === 'streaming'

  // Scroll to bottom whenever messages update or streaming starts
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  const isEmpty = messages.length === 0

  return (
    <>
      {/* Scrollable message area */}
      <div
        className="flex-1 overflow-y-auto py-4"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
      >
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <div className="w-12 h-12 rounded-full border border-iris-700/50 flex items-center justify-center">
              <span className="font-serif text-xl text-iris-400 leading-none">I</span>
            </div>
            <div>
              <p className="font-serif text-2xl text-text-primary mb-1">
                {userContext?.name
                  ? `Hello, ${userContext.name}.`
                  : 'Hello.'}
              </p>
              <p className="font-sans text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                I&apos;m IRIS — your sobriety companion. How are you doing today?
              </p>
            </div>
          </div>
        )}

        {messages.map((message, i) => {
          const isLastMessage = i === messages.length - 1
          const showStreamingCursor =
            isLastMessage && message.role === 'assistant' && isStreaming

          return (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={showStreamingCursor}
            />
          )
        })}

        {/* Crisis alert — rendered inline in the message flow */}
        {crisisState && (
          <CrisisAlert crisis={crisisState} onDismiss={dismissCrisis} />
        )}

        {/* Error state */}
        {error && (
          <div className="mx-4 my-2 px-4 py-3 rounded-xl border border-error/30 bg-error/8">
            <p className="font-sans text-xs text-error">
              Something went wrong. Please try sending your message again.
            </p>
          </div>
        )}

        {/* Invisible scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Sticky input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onStop={stop}
        isDisabled={isDisabled}
        isStreaming={isStreaming}
      />
    </>
  )
}
