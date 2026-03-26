import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const RequestSchema = z.object({
  history: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
  questionIndex: z.number().int().min(0).max(9),
})

const SYSTEM_PROMPT = `You are the onboarding interviewer for IRIS, an AI sobriety companion app.

Your job is to learn about the user through a warm, conversational interview — max 10 questions total.
You must naturally weave in validated screening questions from these instruments:
- AUDIT (alcohol use)
- DAST (drug abuse screening)
- PHQ-9 (depression)
- GAD-7 (anxiety)
- ASRS-6 (ADHD screening)

Do NOT use clinical language. Do NOT mention the instrument names. Ask questions naturally, as if having a caring conversation. Use the user's previous answers to choose what to ask next.

Based on the conversation history, generate exactly ONE next question.

Your response must be valid JSON with this exact shape:
{
  "question": "The next question to ask the user",
  "type": "text" | "select" | "multiselect",
  "options": ["option1", "option2"] // only for select/multiselect types
  "field": "substances" | "sobrietyDate" | "goals" | "triggers" | "tonePreference" | "mood" | "screening" | null
}

Question flow guidance:
- Q1-2: Establish rapport, ask what they're recovering from (maps to substances)
- Q3: When their journey started (maps to sobrietyDate)
- Q4-5: What matters most to them / goals (maps to goals)
- Q6-7: Situations that challenge them (maps to triggers), weave in mood/anxiety screening
- Q8-9: How they prefer support (maps to tonePreference), weave in remaining screening
- Q10: Closing — affirm their courage, ask if there's anything else

Be warm, not clinical. One question at a time. No preamble text — ONLY the JSON object.`

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join('; ') },
      { status: 400 },
    )
  }

  const { history, questionIndex } = parsed.data

  // Build conversation context for the LLM
  const historyText = history
    .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
    .join('\n\n')

  const userPrompt = questionIndex === 0
    ? 'Generate the first question to start the onboarding conversation. Make it warm and welcoming.'
    : `Here is the conversation so far:\n\n${historyText}\n\nGenerate question ${questionIndex + 1} of 10.`

  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.7,
    maxOutputTokens: 500,
  })

  // Parse the JSON response
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const questionData = JSON.parse(cleaned) as {
      question: string
      type: string
      options?: string[]
      field?: string | null
    }

    return NextResponse.json(questionData)
  } catch {
    // Fallback if LLM doesn't return valid JSON
    return NextResponse.json({
      question: text,
      type: 'text',
      options: null,
      field: null,
    })
  }
}
