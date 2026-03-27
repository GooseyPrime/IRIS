/**
 * Supabase generated types.
 * Replace this stub with the output of:
 *   pnpm supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          sobriety_date: string | null
          display_name: string | null
          substances: string[]
          goals: string[]
          tone_preference: string
          triggers: string[]
          account_tier: 'free' | 'premium' | 'sponsor'
          onboarding_completed: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          sobriety_date?: string | null
          display_name?: string | null
          substances?: string[]
          goals?: string[]
          tone_preference?: string
          triggers?: string[]
          account_tier?: 'free' | 'premium' | 'sponsor'
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          sobriety_date?: string | null
          display_name?: string | null
          substances?: string[]
          goals?: string[]
          tone_preference?: string
          triggers?: string[]
          account_tier?: 'free' | 'premium' | 'sponsor'
          onboarding_completed?: boolean
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string | null
          ended_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          created_at: string
          conversation_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          flagged_crisis: boolean
          crisis_tier: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          conversation_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          flagged_crisis?: boolean
          crisis_tier?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          flagged_crisis?: boolean
          crisis_tier?: number | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          id: string
          created_at: string
          user_id: string
          mood: number
          emotions: string[]
          note: string | null
          sober_today: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          mood: number
          emotions?: string[]
          note?: string | null
          sober_today: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          mood?: number
          emotions?: string[]
          note?: string | null
          sober_today?: boolean
        }
        Relationships: []
      }
      assessments: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: string
          responses: Json
          score: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: string
          responses: Json
          score?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: string
          responses?: Json
          score?: number | null
        }
        Relationships: []
      }
      crisis_events: {
        Row: {
          id: string
          created_at: string
          user_id: string
          message_id: string | null
          crisis_tier: number
          message_text: string
          resolved: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          message_id?: string | null
          crisis_tier: number
          message_text: string
          resolved?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          message_id?: string | null
          crisis_tier?: number
          message_text?: string
          resolved?: boolean
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          created_at: string
          user_id: string
          nps_score: number | null
          comment: string | null
          category: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          nps_score?: number | null
          comment?: string | null
          category?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          nps_score?: number | null
          comment?: string | null
          category?: string | null
        }
        Relationships: []
      }
      pending_sponsorships: {
        Row: {
          id: string
          created_at: string
          recipient_email: string
          stripe_session_id: string
          tier: string
          applied: boolean
          applied_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          recipient_email: string
          stripe_session_id: string
          tier: string
          applied?: boolean
          applied_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          recipient_email?: string
          stripe_session_id?: string
          tier?: string
          applied?: boolean
          applied_at?: string | null
        }
        Relationships: []
      }
      mobile_subscriptions: {
        Row: {
          id: string
          user_id: string
          provider: 'stripe' | 'apple' | 'google'
          platform: 'ios' | 'android'
          product_id: string
          external_customer_id: string | null
          external_subscription_id: string
          status: 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          latest_event_at: string
          raw_payload: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'stripe' | 'apple' | 'google'
          platform: 'ios' | 'android'
          product_id: string
          external_customer_id?: string | null
          external_subscription_id: string
          status: 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          latest_event_at?: string
          raw_payload?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'stripe' | 'apple' | 'google'
          platform?: 'ios' | 'android'
          product_id?: string
          external_customer_id?: string | null
          external_subscription_id?: string
          status?: 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          latest_event_at?: string
          raw_payload?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mobile_subscription_events: {
        Row: {
          id: string
          user_id: string | null
          provider: 'stripe' | 'apple' | 'google'
          platform: 'ios' | 'android'
          event_type: string
          external_subscription_id: string | null
          status: 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired' | null
          event_at: string
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          provider: 'stripe' | 'apple' | 'google'
          platform: 'ios' | 'android'
          event_type: string
          external_subscription_id?: string | null
          status?: 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired' | null
          event_at?: string
          payload?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          provider?: 'stripe' | 'apple' | 'google'
          platform?: 'ios' | 'android'
          event_type?: string
          external_subscription_id?: string | null
          status?: 'active' | 'trialing' | 'grace_period' | 'past_due' | 'canceled' | 'expired' | null
          event_at?: string
          payload?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      account_tier: 'free' | 'premium' | 'sponsor'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
