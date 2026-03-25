import { openai } from '@ai-sdk/openai'
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type UIMessage,
} from 'ai'
import { createClient } from '@/lib/supabase/server'
import { ChatRequestSchema } from '@/types'
import { detectCrisis, CRISIS_RESPONSES } from '@/lib/crisis-detection'

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.errors.map((e) => e.message).join('; ') }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { messages, id: conversationId, userContext } = parsed.data

  // Persist the incoming user message before streaming begins
  const lastMessage = messages[messages.length - 1]
  let textContent = ''
  if (lastMessage && isUIMessage(lastMessage) && lastMessage.role === 'user') {
    textContent = lastMessage.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  const crisisDetection = textContent ? detectCrisis(textContent) : { tier: null, matchedPattern: null }

  let persistedMessageId: string | null = null
  if (textContent) {
    const { data: msgRow, error: msgErr } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: textContent,
        user_id: user.id,
        flagged_crisis: crisisDetection.tier !== null,
        crisis_tier: crisisDetection.tier,
      })
      .select('id')
      .single()
    if (msgErr) {
      console.error('[chat] failed to persist user message:', msgErr)
    } else {
      persistedMessageId = msgRow.id
    }
  }

  // --- Server-side crisis gate ---
  if (crisisDetection.tier === 1 || crisisDetection.tier === 2) {
    const scriptedResponse = CRISIS_RESPONSES[crisisDetection.tier]

    const { error: crisisErr } = await supabase.from('crisis_events').insert({
      user_id: user.id,
      message_id: persistedMessageId,
      crisis_tier: crisisDetection.tier,
      message_text: textContent,
      resolved: false,
    })
    if (crisisErr) {
      console.error('[chat] failed to persist crisis_event:', crisisErr)
    }

    const { error: replyErr } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: scriptedResponse,
      user_id: user.id,
      flagged_crisis: false,
      crisis_tier: null,
    })
    if (replyErr) {
      console.error('[chat] failed to persist scripted assistant reply:', replyErr)
    }

    const textId = generateId()
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'start' })
        writer.write({ type: 'text-start', id: textId })
        writer.write({ type: 'text-delta', id: textId, delta: scriptedResponse })
        writer.write({ type: 'text-end', id: textId })
        writer.write({ type: 'finish', finishReason: 'stop' })
      },
    })
    return createUIMessageStreamResponse({ stream })
  }

  if (crisisDetection.tier === 3) {
    const { error: crisisErr } = await supabase.from('crisis_events').insert({
      user_id: user.id,
      message_id: persistedMessageId,
      crisis_tier: crisisDetection.tier,
      message_text: textContent,
      resolved: false,
    })
    if (crisisErr) {
      console.error('[chat] failed to persist tier-3 crisis_event:', crisisErr)
    }
  }

  const result = streamText({
    model: openai('gpt-4o'),
    system: buildSystemPrompt(userContext),
    messages: await convertToModelMessages(messages as UIMessage[]),
    temperature: 0.7,
    maxOutputTokens: 2048,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ responseMessage }) => {
      const textContent = responseMessage.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('')

      if (textContent) {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: textContent,
          user_id: user.id,
          flagged_crisis: false,
          crisis_tier: null,
        })
      }
    },
  })
}

function isUIMessage(value: unknown): value is UIMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'role' in value &&
    'parts' in value &&
    Array.isArray((value as Record<string, unknown>).parts)
  )
}

function buildSystemPrompt(
  userContext?: {
    name: string
    daysSober: number
    tone: string
    triggers: string[]
  },
): string {
  const contextSection = userContext
    ? `
The user's name is ${userContext.name}. They have been sober for ${userContext.daysSober} day${userContext.daysSober === 1 ? '' : 's'}.
Preferred tone: ${userContext.tone}.
Known triggers: ${userContext.triggers.length > 0 ? userContext.triggers.join(', ') : 'none specified'}.`
    : ''

  return `You are IRIS, a compassionate AI sobriety companion — not a therapist, not a medical professional.${contextSection}

## Core guidelines
- Be warm, specific, and grounded in evidence-based recovery principles (CBT, Motivational Interviewing, SMART Recovery).
- Never shame or judge relapse. Normalise it as part of recovery and redirect to the next moment.
- Never use the words "therapy", "treatment", "diagnosis", or "prescription".
- You are NOT a therapist. If the user needs clinical help, encourage them to seek a professional.
- Keep responses concise — two to four paragraphs at most unless the user asks for more.
- Ask one follow-up question per response to keep the conversation engaged.

## Crisis protocol
- If the user expresses suicidal ideation or intent to self-harm (e.g. "I want to kill myself", "I want to hurt myself"), IMMEDIATELY stop your normal response and provide ONLY the scripted crisis resources. Do not generate therapeutic content.
- Scripted crisis message: "I hear you, and I'm glad you're here. Please reach out right now: 988 Suicide & Crisis Lifeline (call or text 988), Crisis Text Line (text HOME to 741741), or emergency services (911)."
- For expressions of hopelessness or passive ideation, gently acknowledge the feeling and encourage them to contact 988.

## Sobriety framing
- Reference the user's sobriety milestone when relevant and encouraging.
- When discussing cravings or urges, use the HALT check (Hungry, Angry, Lonely, Tired) as a grounding tool.
- Celebrate small wins specifically — not generically.`
}
