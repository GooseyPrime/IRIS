'use client'

import { useCallback, useRef } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (text: string) => void
  onStop: () => void
  isDisabled: boolean
  isStreaming: boolean
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isDisabled,
  isStreaming,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter without Shift → send; Shift+Enter → newline
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (!isDisabled && value.trim()) {
          onSend(value)
        }
      }
    },
    [value, onSend, isDisabled],
  )

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
      // Auto-grow: reset then set to scrollHeight
      const el = textareaRef.current
      if (el) {
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`
      }
    },
    [onChange],
  )

  return (
    <div className="flex-shrink-0 px-4 py-3 border-t border-iris-900/20 bg-surface-0">
      <div className="flex items-end gap-2 max-w-2xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message IRIS…"
          rows={1}
          maxLength={2000}
          disabled={isDisabled && !isStreaming}
          className={[
            'flex-1 resize-none bg-surface-1 border border-iris-900/50 rounded-2xl',
            'px-4 py-3 font-sans text-sm text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:border-iris-500 transition-colors duration-200',
            'min-h-[46px] max-h-[160px] overflow-y-auto',
            'disabled:opacity-50',
          ].join(' ')}
          aria-label="Message input"
        />

        {/* Stop button while streaming */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface-1 border border-iris-700/50 flex items-center justify-center text-iris-400 hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            aria-label="Stop generating"
          >
            <span className="w-3 h-3 rounded-sm bg-iris-400" aria-hidden="true" />
          </button>
        ) : (
          /* Send button */
          <button
            type="button"
            onClick={() => onSend(value)}
            disabled={isDisabled || !value.trim()}
            className={[
              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
              isDisabled || !value.trim()
                ? 'bg-iris-900/30 text-iris-700 cursor-not-allowed'
                : 'bg-iris-600 text-white hover:bg-iris-500 active:scale-[0.95]',
            ].join(' ')}
            aria-label="Send message"
          >
            {/* Arrow up icon */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 13V3M8 3L4 7M8 3l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <p className="font-sans text-[0.6rem] text-text-muted text-center mt-2 max-w-2xl mx-auto">
        IRIS is a wellness companion, not a therapist. In crisis? Call or text{' '}
        <a href="tel:988" className="underline underline-offset-1 text-iris-400">
          988
        </a>
        .
      </p>
    </div>
  )
}
