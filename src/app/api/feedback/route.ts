import { createClient } from '@/lib/supabase/server'
import { FeedbackSchema } from '@/types'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = FeedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors.map((e) => e.message).join('; ') },
      { status: 400 },
    )
  }

  const { npsScore, comment, category } = parsed.data

  const { error: insertError } = await supabase.from('feedback').insert({
    user_id: user.id,
    nps_score: npsScore ?? null,
    comment: comment ?? null,
    category: category ?? null,
  })

  if (insertError) {
    console.error('[feedback] insert error:', insertError)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
