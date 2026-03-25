'use client'

import { useRef, useCallback } from 'react'
import type { ChatStatus } from 'ai'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  onStop: () => void
  status: ChatStatus
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  status,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isActive = status === 'submitted' || status === 'streaming'
  const canSend = input.trim().length > 0 && status === 'ready'

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (canSend) {
          onSubmit()
        }
      }
    },
    [canSend, onSubmit],
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
      const target = e.target
      target.style.height = 'auto'
      target.style.height = `${Math.min(target.scrollHeight, 160)}px`
    },
    [setInput],
  )

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (canSend) {
        onSubmit()
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    },
    [canSend, onSubmit],
  )

  return (
    <div className="border-t border-iris-900/20 bg-surface-0/95 backdrop-blur-sm px-4 py-3">
      {status === 'error' && (
        <p className="text-error text-xs font-sans mb-2 px-1">
          Something went wrong. Please try again.
        </p>
      )}

      <form
        onSubmit={handleFormSubmit}
        className="flex items-end gap-3 max-w-2xl mx-auto"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Share what's on your mind..."
          rows={1}
          disabled={isActive}
          className="flex-1 resize-none bg-surface-2 border border-iris-900/50 rounded-xl px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-iris-500 transition-colors duration-200 disabled:opacity-50 max-h-40 scroll-smooth"
          aria-label="Message input"
        />

        {isActive ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-iris-600 text-iris-400 hover:bg-iris-600/10 transition-all duration-200 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            aria-label="Stop generating"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="10" height="10" rx="1.5" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-sacred-iris text-white hover:opacity-90 active:scale-[0.96] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </form>
    </div>
  )
}
