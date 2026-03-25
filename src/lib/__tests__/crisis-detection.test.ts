import { describe, it, expect } from 'vitest'
import { detectCrisis, normalizeText } from '../crisis-detection'

// ---------------------------------------------------------------------------
// Normalization tests
// ---------------------------------------------------------------------------

describe('normalizeText', () => {
  it('lowercases input', () => {
    expect(normalizeText('I WANT TO DIE')).toBe('i want to die')
  })

  it('collapses whitespace', () => {
    expect(normalizeText('kill   myself')).toBe('kill myself')
  })

  it('decodes basic l33tspeak', () => {
    expect(normalizeText('k1ll mys3lf')).toBe('kill myself')
  })

  it('normalizes right single quote to apostrophe', () => {
    const result = normalizeText("can\u2019t go on")
    expect(result).toContain("can't")
  })

  it('strips zero-width characters', () => {
    expect(normalizeText('sui\u200Bcide')).toBe('suicide')
  })
})

// ---------------------------------------------------------------------------
// Tier 1 — active suicidal ideation / self-harm intent (14 scenarios)
// ---------------------------------------------------------------------------

describe('Tier 1 — active suicidal ideation / self-harm', () => {
  const tier1Inputs = [
    'I want to kill myself',
    'I\'m going to end my life tonight',
    'I\'ve been thinking about suicide',
    'I want to die',
    'I\'m going to hurt myself',
    'I\'ve been cutting myself',
    'I want to take my own life',
    'I wrote a suicide note',
    'I bought a gun to end it',
    'I don\'t want to be alive anymore',
    'I have pills and I plan to overdose on purpose',
    'I\'m going to jump off the bridge',
    'this is my final goodbye to everyone',
    'I plan to kill myself tomorrow',
  ]

  it.each(tier1Inputs)('detects tier 1: "%s"', (input) => {
    const result = detectCrisis(input)
    expect(result.tier).toBe(1)
    expect(result.matchedPattern).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tier 2 — passive ideation / hopelessness with suicidal undertone (15 scenarios)
// ---------------------------------------------------------------------------

describe('Tier 2 — passive ideation / burden / desire to disappear', () => {
  const tier2Inputs = [
    'I don\'t want to be here anymore',
    'I can\'t go on like this',
    'there\'s no reason to live',
    'everyone would be better off without me',
    'I\'m ready to go to sleep forever',
    'I can\'t take it anymore',
    'I\'m just a burden to my family',
    'I wish I was never born',
    'I wish I were dead',
    'nobody would miss me if I was gone',
    'there\'s no way out of this',
    'I cannot live like this',
    'no point in going on',
    'life isn\'t worth living',
    'the world would be better without me',
  ]

  it.each(tier2Inputs)('detects tier 2: "%s"', (input) => {
    const result = detectCrisis(input)
    expect(result.tier).toBe(2)
    expect(result.matchedPattern).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tier 3 — emotional distress / hopelessness (15 scenarios)
// ---------------------------------------------------------------------------

describe('Tier 3 — emotional distress / hopelessness', () => {
  const tier3Inputs = [
    'I wonder if anyone would notice if I disappeared',
    'I\'m feeling hopeless about everything',
    'what\'s the point of any of this',
    'I\'m so tired of fighting every single day',
    'I give up',
    'nothing matters anymore',
    'it\'s never going to get better',
    'I\'m completely alone in this',
    'no one cares about me',
    'I hate myself so much',
    'I\'m broken beyond repair',
    'I\'m worthless',
    'I\'m done with everything',
    'I\'m never going to recover from this',
    'I relapsed and I\'m never going to recover',
  ]

  it.each(tier3Inputs)('detects tier 3: "%s"', (input) => {
    const result = detectCrisis(input)
    expect(result.tier).toBe(3)
    expect(result.matchedPattern).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Safe messages — false positive prevention (16 scenarios)
// ---------------------------------------------------------------------------

describe('Safe messages — no crisis detected', () => {
  const safeInputs = [
    'I had a great day today',
    'I\'m feeling pretty good about my recovery',
    'My sponsor and I talked about cravings',
    'I went to a meeting tonight',
    'Work was stressful but I managed',
    'I\'m tired today but in a normal way',
    'I had an argument with my partner',
    'I feel anxious about the weekend',
    'I\'m struggling with cravings but staying strong',
    'Sometimes I wonder if things will get easier',
    'I miss my old life sometimes',
    'Today was hard but I didn\'t drink',
    'I\'m nervous about going to the party sober',
    'I cried a lot today but I feel a little better now',
    'The holidays are going to be tough',
    'I feel sad but I know it will pass',
  ]

  it.each(safeInputs)('returns null for safe message: "%s"', (input) => {
    const result = detectCrisis(input)
    expect(result.tier).toBeNull()
    expect(result.matchedPattern).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Obfuscation resistance
// ---------------------------------------------------------------------------

describe('Obfuscation resistance', () => {
  it('detects l33tspeak: "k1ll mys3lf"', () => {
    expect(detectCrisis('k1ll mys3lf').tier).toBe(1)
  })

  it('detects with extra spaces: "kill    myself"', () => {
    expect(detectCrisis('kill    myself').tier).toBe(1)
  })

  it('detects ALL CAPS: "I WANT TO DIE"', () => {
    expect(detectCrisis('I WANT TO DIE').tier).toBe(1)
  })

  it('detects mixed case: "SuIcIdE"', () => {
    expect(detectCrisis('SuIcIdE').tier).toBe(1)
  })

  it('detects with smart quotes: "don\u2019t want to be here"', () => {
    expect(detectCrisis("don\u2019t want to be here").tier).toBe(2)
  })

  it('detects with zero-width chars: "sui\\u200Bcide"', () => {
    expect(detectCrisis('sui\u200Bcide').tier).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Tier priority — higher severity wins
// ---------------------------------------------------------------------------

describe('Tier priority', () => {
  it('returns tier 1 when message matches both tier 1 and tier 3', () => {
    const result = detectCrisis('I feel hopeless and I want to kill myself')
    expect(result.tier).toBe(1)
  })

  it('returns tier 1 when message matches both tier 1 and tier 2', () => {
    const result = detectCrisis("I'm a burden and I'm going to end my life")
    expect(result.tier).toBe(1)
  })

  it('returns tier 2 when message matches both tier 2 and tier 3', () => {
    const result = detectCrisis("nothing matters and I can't go on anymore")
    expect(result.tier).toBe(2)
  })
})
