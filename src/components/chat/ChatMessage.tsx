import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={[
        'flex w-full px-4 py-1',
        isUser ? 'justify-end' : 'justify-start',
      ].join(' ')}
    >
      {/* Avatar for assistant */}
      {isAssistant && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full border border-iris-700/60 flex items-center justify-center mr-2 mt-0.5">
          <span className="font-serif text-[0.65rem] text-iris-400 leading-none">I</span>
        </div>
      )}

      <div
        className={[
          'max-w-[78%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-iris-600 text-white rounded-br-md'
            : 'bg-surface-1 border border-iris-900/30 text-text-primary rounded-bl-md',
        ].join(' ')}
      >
        {/* Render message.parts — never message.content */}
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return (
              <p
                key={i}
                className={[
                  'font-sans text-sm leading-relaxed whitespace-pre-wrap',
                  isUser ? 'text-white' : 'text-text-primary',
                ].join(' ')}
              >
                {part.text}
              </p>
            )
          }
          // Other part types (tool calls, etc.) — ignore for now
          return null
        })}

        {/* Streaming pulse indicator for the last assistant message */}
        {isAssistant && isStreaming && (
          <span
            className="inline-block w-2 h-4 ml-0.5 bg-iris-400 rounded-sm animate-pulse align-text-bottom"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
