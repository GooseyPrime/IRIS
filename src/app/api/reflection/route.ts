import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { ReflectionSummaryRequestSchema, MOOD_LABELS } from '@/types'

export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body: unknown = await req.json()
  const parsed = ReflectionSummaryRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { soberToday, mood, activities, journal, userContext } = parsed.data
  const moodLabel = MOOD_LABELS[mood as keyof typeof MOOD_LABELS] ?? 'Unknown'

  const prompt = buildReflectionPrompt({
    soberToday,
    moodLabel,
    activities,
    journal,
    userContext,
  })

  const result = streamText({
    model: openai('gpt-4o'),
    system: buildSystemPrompt(userContext),
    prompt,
    temperature: 0.8,
    maxOutputTokens: 600,
    abortSignal: req.signal,
  })

  return result.toTextStreamResponse()
}

function buildSystemPrompt(
  userContext?: { name: string; daysSober: number; tone: string },
): string {
  return `You are IRIS, a compassionate AI sobriety companion — not a therapist.
${
  userContext
    ? `The user's name is ${userContext.name}. They are ${userContext.daysSober} days sober.
Preferred tone: ${userContext.tone}.`
    : ''
}

You are writing a brief evening reflection summary for the user based on their check-in data.

Guidelines:
- Be warm, personal, and specific to what they shared.
- If they stayed sober, celebrate it — every day counts.
- If they did not stay sober, do NOT shame them. Acknowledge their honesty and remind them that recovery is not linear.
- Reference specific activities they mentioned.
- If they wrote a journal entry, reflect on its themes with empathy.
- Keep it concise — 3-5 sentences max.
- End with gentle encouragement or a reflective question for tomorrow.
- Never use the words "therapy", "treatment", or "diagnosis".
- You are NOT a therapist. Never diagnose or prescribe.`
}

function buildReflectionPrompt(data: {
  soberToday: boolean
  moodLabel: string
  activities: string[]
  journal?: string | undefined
  userContext?: { name: string; daysSober: number; tone: string } | undefined
}): string {
  const parts: string[] = []

  parts.push(
    data.soberToday
      ? 'The user confirmed they stayed sober today.'
      : 'The user shared that they did not stay sober today.',
  )

  parts.push(`Their mood today: ${data.moodLabel}.`)

  if (data.activities.length > 0) {
    parts.push(`Activities today: ${data.activities.join(', ')}.`)
  } else {
    parts.push('They did not select any activities for today.')
  }

  if (data.journal && data.journal.trim().length > 0) {
    parts.push(`Their journal entry: "${data.journal.trim()}"`)
  }

  parts.push(
    'Write a personalized evening reflection summary based on the above. Be specific, warm, and brief.',
  )

  return parts.join('\n\n')
}
