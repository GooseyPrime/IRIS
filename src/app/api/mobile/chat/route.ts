import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getMobileEntitlementSnapshot } from '@/lib/mobile-subscriptions'
import { getAuthenticatedRequestContext } from '@/lib/supabase/request-context'
import { detectCrisis, CRISIS_RESPONSES } from '@/lib/crisis-detection'
import { logCrisisEvent } from '@/lib/log-crisis-event'

const MobileChatRequestSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(10000),
  userContext: z
    .object({
      name: z.string(),
      daysSober: z.number().int().min(0),
      tone: z.string(),
      triggers: z.array(z.string()),
    })
    .optional(),
})

export async function POST(request: Request) {
  const context = await getAuthenticatedRequestContext(request)
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = MobileChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join('; ') },
      { status: 400 },
    )
  }

  try {
    const entitlement = await getMobileEntitlementSnapshot(
      context.supabase,
      context.user.id,
    )
    if (!entitlement.hasMobileAiAccess) {
      return NextResponse.json(
        {
          error: 'Mobile subscription required for AI chat access.',
          code: 'MOBILE_SUBSCRIPTION_REQUIRED',
        },
        { status: 402 },
      )
    }
  } catch (entitlementErr) {
    console.error('[mobile/chat] failed to resolve entitlement:', entitlementErr)
    return NextResponse.json(
      { error: 'Failed to verify mobile subscription status.' },
      { status: 500 },
    )
  }

  const { conversationId, message, userContext } = parsed.data

  try {
    const { error: sessionError } = await context.supabase.from('sessions').upsert({
      id: conversationId,
      user_id: context.user.id,
      title: null,
    })
    if (sessionError) {
      throw sessionError
    }

    const crisisDetection = detectCrisis(message)

    const { error: insertUserError } = await context.supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      user_id: context.user.id,
      flagged_crisis: crisisDetection.tier !== null,
      crisis_tier: crisisDetection.tier,
    })
    if (insertUserError) {
      throw insertUserError
    }

    if (crisisDetection.tier === 1 || crisisDetection.tier === 2) {
      const scriptedResponse = CRISIS_RESPONSES[crisisDetection.tier]

      await logCrisisEvent({
        supabase: context.supabase,
        userId: context.user.id,
        messageId: null,
        crisisTier: crisisDetection.tier,
        messageText: message,
      })

      const { error: insertScriptedReplyError } = await context.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: scriptedResponse,
          user_id: context.user.id,
          flagged_crisis: false,
          crisis_tier: null,
        })
      if (insertScriptedReplyError) {
        throw insertScriptedReplyError
      }

      return NextResponse.json({ reply: scriptedResponse })
    }

    if (crisisDetection.tier === 3) {
      await logCrisisEvent({
        supabase: context.supabase,
        userId: context.user.id,
        messageId: null,
        crisisTier: crisisDetection.tier,
        messageText: message,
      })
    }

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: buildSystemPrompt(userContext),
      prompt: message,
      temperature: 0.7,
      maxOutputTokens: 1200,
    })

    const assistantReply = text.trim()

    const { error: insertAssistantError } = await context.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantReply,
        user_id: context.user.id,
        flagged_crisis: false,
        crisis_tier: null,
      })
    if (insertAssistantError) {
      throw insertAssistantError
    }

    return NextResponse.json({ reply: assistantReply })
  } catch (err) {
    console.error('[mobile/chat] failed to handle message:', err)
    return NextResponse.json(
      { error: 'Failed to process mobile chat message.' },
      { status: 500 },
    )
  }
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
    ? `User name: ${userContext.name}
Days sober: ${userContext.daysSober}
Preferred tone: ${userContext.tone}
Known triggers: ${userContext.triggers.length > 0 ? userContext.triggers.join(', ') : 'none specified'}`
    : 'No additional user context supplied.'

  return `You are IRIS, a compassionate AI sobriety companion. You are not a therapist, and you must not use the terms therapy, treatment, diagnosis, or prescription.
${contextSection}

Guidelines:
- Be warm and grounded.
- Keep responses concise.
- Ask one gentle follow-up question when appropriate.
- Do not shame relapse; focus on next steps.`
}
