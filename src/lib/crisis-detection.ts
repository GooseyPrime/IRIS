/**
 * Crisis detection runs client-side BEFORE a message is sent to the AI.
 * Tier 1 / 2 responses are SCRIPTED — never AI-generated.
 * Any change to these patterns requires clinical review.
 */

const CRISIS_PATTERNS = {
  tier1: [
    /\b(suicide|suicidal|kill myself|end my life|want to die)\b/i,
    /\b(self.?harm|cut myself|hurt myself)\b/i,
  ],
  tier2: [
    /\b(don't want to be here|can't go on|no reason to live)\b/i,
    /\b(everyone would be better off without me)\b/i,
    /\b(ready to go home|go to sleep forever)\b/i,
  ],
  tier3: [
    /\bI wonder if anyone would notice\b/i,
    /\b(feeling hopeless|no hope)\b/i,
  ],
} as const satisfies Record<'tier1' | 'tier2' | 'tier3', readonly RegExp[]>

export type CrisisTier = 1 | 2 | 3 | null

export function detectCrisis(text: string): CrisisTier {
  if (CRISIS_PATTERNS.tier1.some((p) => p.test(text))) return 1
  if (CRISIS_PATTERNS.tier2.some((p) => p.test(text))) return 2
  if (CRISIS_PATTERNS.tier3.some((p) => p.test(text))) return 3
  return null
}

export const CRISIS_RESPONSES: Record<1 | 2 | 3, string> = {
  1: `I hear you, and I'm glad you're still here talking with me. What you're feeling is real, and you deserve support right now.

**Please reach out immediately:**
- 📞 **988 Suicide & Crisis Lifeline** — call or text 988
- 📱 **Crisis Text Line** — text HOME to 741741
- 📞 **SAMHSA Helpline** — 1-800-662-4357
- 🚨 **Emergency** — 911

You don't have to face this alone. These lines are free, confidential, and available 24/7.`,

  2: `It sounds like things feel really heavy right now. That takes courage to share.

When you're ready, please consider reaching out:
- 📞 **988 Suicide & Crisis Lifeline** — call or text 988
- 📱 **Crisis Text Line** — text HOME to 741741

I'm here with you, and I also want you to have human support.`,

  3: `I noticed something in what you shared, and I want to check in. How are you really doing right now?

If things feel overwhelming, you can always reach **988** (call or text) — they're there for exactly these moments.`,
}
