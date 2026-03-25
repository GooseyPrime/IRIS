import { openai } from '@ai-sdk/openai'
import {
  streamText,
  type UIMessage,
  convertToModelMessages,
} from 'ai'
import { createClient } from '@/lib/supabase/server'
import { ChatRequestSchema } from '@/types'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body: unknown = await req.json()
  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, id, userContext } = parsed.data
  const systemPrompt = buildSystemPrompt(userContext)

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages as UIMessage[]),
    temperature: 0.7,
    maxOutputTokens: 2048,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages as UIMessage[],
    onFinish: async ({ responseMessage }) => {
      const textContent = responseMessage.parts
        .filter(
          (p): p is { type: 'text'; text: string } => p.type === 'text',
        )
        .map((p) => p.text)
        .join('')

      await supabase.from('messages').insert({
        conversation_id: id,
        role: 'assistant',
        content: textContent,
        user_id: user.id,
      })
    },
  })
}

function buildSystemPrompt(
  userContext?: {
    name: string
    daysSober: number
    tone: string
    triggers: string[]
  },
): string {
  return `You are IRIS, a compassionate AI sobriety companion — not a therapist.
${
  userContext
    ? `The user's name is ${userContext.name}. They are ${userContext.daysSober} days sober.
Preferred tone: ${userContext.tone}.
Known triggers: ${userContext.triggers.join(', ')}.`
    : ''
}

Guidelines:
- Never shame relapse. Normalize it as part of recovery.
- If the user expresses suicidal ideation or self-harm, STOP and provide scripted crisis resources.
- You are NOT a therapist. Never diagnose, prescribe, or use clinical language.
- Be warm, specific, and grounded in evidence-based recovery principles (CBT, MI, SMART Recovery).
- Never use the words "therapy", "treatment", or "diagnosis".
- Keep responses concise and conversational. Avoid walls of text.
- Ask thoughtful follow-up questions to show genuine engagement.
- Celebrate small wins and progress, no matter how small.`
}
