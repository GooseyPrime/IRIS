'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { UIMessage } from 'ai'
import type { ChatStatus } from 'ai'

interface MessageListProps {
  messages: UIMessage[]
  status: ChatStatus
}

export function MessageList({ messages, status }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsUserScrolledUp(false)
  }, [])

  useEffect(() => {
    if (!isUserScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isUserScrolledUp])

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    setIsUserScrolledUp(distanceFromBottom > 100)
  }, [])

  const isStreaming = status === 'streaming' || status === 'submitted'

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 rounded-full bg-iris-600/20 flex items-center justify-center mb-6">
            <span className="font-serif text-2xl text-iris-400">I</span>
          </div>
          <h2 className="font-serif font-light text-2xl text-text-primary mb-3">
            Welcome to IRIS
          </h2>
          <p className="font-sans text-sm text-text-secondary max-w-sm leading-relaxed">
            I&apos;m here to walk alongside you on your recovery journey.
            Share what&apos;s on your mind — no judgment, just support.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
        <div className="flex justify-start">
          <div className="bg-surface-1 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] border border-iris-900/20">
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      {isUserScrolledUp && messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-6 z-10 w-10 h-10 rounded-full bg-surface-2 border border-iris-900/30 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-iris-600/50 transition-all duration-200 shadow-lg"
          aria-label="Scroll to bottom"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 3v10M4 9l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-iris-600 text-white rounded-br-sm'
            : 'bg-surface-1 text-text-primary rounded-bl-sm border border-iris-900/20',
        ].join(' ')}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return (
              <div
                key={`${message.id}-${i}`}
                className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words"
              >
                {part.text}
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="IRIS is typing">
      <span className="w-2 h-2 rounded-full bg-iris-400 animate-pulse" />
      <span
        className="w-2 h-2 rounded-full bg-iris-400 animate-pulse"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-2 h-2 rounded-full bg-iris-400 animate-pulse"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  )
}
