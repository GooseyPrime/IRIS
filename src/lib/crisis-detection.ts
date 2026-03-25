/**
 * Crisis detection runs client-side BEFORE a message is sent to the AI.
 * Tier 1 / 2 responses are SCRIPTED — never AI-generated.
 * Any change to these patterns requires clinical review.
 */

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export type CrisisTier = 1 | 2 | 3 | null

export interface CrisisDetectionResult {
  tier: CrisisTier
  matchedPattern: string | null
}

// ---------------------------------------------------------------------------
// Text normalization
// ---------------------------------------------------------------------------

/**
 * Normalize input text before pattern matching.
 * Handles common obfuscation: l33tspeak, extra whitespace, zero-width chars.
 */
export function normalizeText(raw: string): string {
  let text = raw
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/@/g, 'a')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

  text = text.replace(/[\u2018\u2019\u201A\u201B''`\u0060]/g, "'")

  return text
}

// ---------------------------------------------------------------------------
// Patterns — ordered by severity (highest first within each tier)
// ---------------------------------------------------------------------------

const CRISIS_PATTERNS = {
  tier1: [
    /\b(kill myself|kill\s+my\s*self)\b/,
    /\b(want to die|wanna die|i want to be dead)\b/,
    /\b(end my life|end it all|end this)\b/,
    /\bsuicid(e|al|ing)\b/,
    /\b(take my (own )?life)\b/,
    /\b(self[- ]?harm|cut myself|cutting myself|hurt myself|hurting myself)\b/,
    /\b(jump off|hang myself|shoot myself|overdose on purpose|swallow pills)\b/,
    /\b(slit my wrists?|slit my throat)\b/,
    /\bi('m| am) going to (kill|hurt|end)\b/,
    /\b(don't want to (live|be alive|wake up|exist))\b/,
    /\b(plan to (die|kill|end))\b/,
    /\b(bought a gun|have a gun|got pills|have pills|stockpil(e|ed|ing))\b/,
    /\b(wrote (a |my )?suicide note|goodbye letter)\b/,
    /\b(final goodbye|this is goodbye|saying goodbye for good)\b/,
  ],
  tier2: [
    /\b(don't want to be here|i don't want to be here anymore)\b/,
    /\b(can't (go on|keep going|take (it|this) anymore|do this anymore))\b/,
    /\b(no reason to (live|keep going|stay))\b/,
    /\b(everyone would be better off without me)\b/,
    /\b(world would be better without me)\b/,
    /\b(ready to (go home|go to sleep forever|give up))\b/,
    /\b(no point (in|to) (living|any of this|going on))\b/,
    /\b(i('m| am) (a burden|just a burden|nothing but a burden))\b/,
    /\b(wish i (was|were) never born)\b/,
    /\b(wish i (was|were) dead)\b/,
    /\b(wish i could (disappear|vanish))\b/,
    /\b(nobody (would|will) (miss me|care|notice))\b/,
    /\b(there's no way out|no escape|trapped forever)\b/,
    /\b(i (can't|cannot) live (with|like) this)\b/,
    /\b(life (isn't|is not) worth (it|living))\b/,
  ],
  tier3: [
    /\b(i wonder if anyone would notice)\b/,
    /\b(feeling hopeless|no hope|lost all hope|without hope)\b/,
    /\b(what's the point|what is the point)\b/,
    /\b(i('m| am) (so )?tired of (fighting|trying|everything|this|living))\b/,
    /\b(i (give|gave) up)\b/,
    /\b(i('m| am) (done|finished|over it))\b/,
    /\b(nothing (matters|will change|gets better))\b/,
    /\b(it('s| is) never (going to|gonna) get better)\b/,
    /\b(i('m| am) (completely )?alone)\b/,
    /\b(no one (cares|understands|gets it))\b/,
    /\b(i (hate|despise) (myself|my life|my existence|being alive))\b/,
    /\b(broken beyond (repair|fixing|help))\b/,
    /\b(i('m| am) worthless|i('m| am) nothing)\b/,
    /\b(relapse(d)? and .{0,30}(can't|cannot|don't want to) (go on|keep|continue))\b/,
    /\b(i('m| am) (never going to|never gonna) (recover|get better|be okay))\b/,
  ],
} as const satisfies Record<'tier1' | 'tier2' | 'tier3', readonly RegExp[]>

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/**
 * Detect crisis signals in user text. Returns the highest-severity tier
 * matched along with the first pattern that triggered.
 *
 * The text is normalized before matching to catch basic obfuscation.
 */
export function detectCrisis(text: string): CrisisDetectionResult {
  const normalized = normalizeText(text)

  for (const pattern of CRISIS_PATTERNS.tier1) {
    if (pattern.test(normalized)) {
      return { tier: 1, matchedPattern: pattern.source }
    }
  }

  for (const pattern of CRISIS_PATTERNS.tier2) {
    if (pattern.test(normalized)) {
      return { tier: 2, matchedPattern: pattern.source }
    }
  }

  for (const pattern of CRISIS_PATTERNS.tier3) {
    if (pattern.test(normalized)) {
      return { tier: 3, matchedPattern: pattern.source }
    }
  }

  return { tier: null, matchedPattern: null }
}

// ---------------------------------------------------------------------------
// Scripted responses — NEVER AI-generated for crisis situations
// ---------------------------------------------------------------------------

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
