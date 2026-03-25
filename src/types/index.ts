import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared result type
// ---------------------------------------------------------------------------

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Account tier
// ---------------------------------------------------------------------------

export const ACCOUNT_TIER = {
  FREE: 'free',
  PREMIUM: 'premium',
  SPONSOR: 'sponsor',
} as const

export type AccountTier = (typeof ACCOUNT_TIER)[keyof typeof ACCOUNT_TIER]

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------

export const CheckInSchema = z.object({
  mood: z.number().int().min(1).max(5),
  emotions: z.array(z.string().min(1)).max(10),
  note: z.string().max(1000).optional(),
  soberToday: z.boolean(),
})

export type CheckIn = z.infer<typeof CheckInSchema>

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

export const TonePreferenceSchema = z.enum([
  'warm',
  'direct',
  'spiritual',
  'clinical',
])

export type TonePreference = z.infer<typeof TonePreferenceSchema>

export const UserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  sobrietyDate: z.string().date().optional(),
  goals: z.array(z.string().min(1)).max(20),
  tonePreference: TonePreferenceSchema,
  triggers: z.array(z.string().min(1)).max(50),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

// ---------------------------------------------------------------------------
// Chat / messages
// ---------------------------------------------------------------------------

export const MessageRoleSchema = z.enum(['user', 'assistant'])
export type MessageRole = z.infer<typeof MessageRoleSchema>

export const ChatMessageSchema = z.object({
  conversationId: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string().min(1).max(10000),
  flaggedCrisis: z.boolean().default(false),
  crisisTier: z.number().int().min(1).max(3).nullable().default(null),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const ChatRequestSchema = z.object({
  messages: z.array(z.unknown()),
  id: z.string().uuid(),
  userContext: z
    .object({
      name: z.string(),
      daysSober: z.number().int().min(0),
      tone: z.string(),
      triggers: z.array(z.string()),
    })
    .optional(),
})

export type ChatRequest = z.infer<typeof ChatRequestSchema>

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export const AssessmentSchema = z.object({
  type: z.string().min(1).max(100),
  responses: z.record(z.string(), z.unknown()),
  score: z.number().nullable().optional(),
})

export type Assessment = z.infer<typeof AssessmentSchema>

// ---------------------------------------------------------------------------
// Crisis events
// ---------------------------------------------------------------------------

export const CrisisTierSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
])

export type CrisisTier = z.infer<typeof CrisisTierSchema>

export const CrisisEventSchema = z.object({
  userId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  crisisTier: CrisisTierSchema,
  messageText: z.string().min(1),
  resolved: z.boolean().default(false),
})

export type CrisisEvent = z.infer<typeof CrisisEventSchema>

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export const FeedbackSchema = z.object({
  npsScore: z.number().int().min(0).max(10).optional(),
  comment: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
})

export type Feedback = z.infer<typeof FeedbackSchema>

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export const SUBSTANCE_OPTIONS = [
  'alcohol',
  'cannabis',
  'opioids',
  'stimulants',
  'benzodiazepines',
  'tobacco',
  'other',
] as const

export type SubstanceOption = (typeof SUBSTANCE_OPTIONS)[number]

export const SubstanceSchema = z.array(
  z.enum(SUBSTANCE_OPTIONS),
).min(1, 'Please select at least one substance')

export const GOAL_OPTIONS = [
  'Stay sober one day at a time',
  'Rebuild relationships',
  'Improve mental health',
  'Regain physical health',
  'Find community and support',
  'Manage cravings',
  'Return to work or school',
] as const

export const TRIGGER_OPTIONS = [
  'Stress',
  'Loneliness',
  'Social events',
  'Anxiety',
  'Boredom',
  'Relationship conflict',
  'Work pressure',
  'Grief or loss',
  'Celebration',
] as const

export const OnboardingDataSchema = z.object({
  substances: SubstanceSchema,
  sobrietyDate: z.string().date().optional(),
  sobrietyDateUnknown: z.boolean(),
  goals: z.array(z.string().min(1)).min(1, 'Please select at least one goal').max(20),
  triggers: z.array(z.string().min(1)).max(50),
  tonePreference: TonePreferenceSchema,
})

export type OnboardingData = z.infer<typeof OnboardingDataSchema>
