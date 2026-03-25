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
          goals: string[]
          tone_preference: string
          triggers: string[]
          account_tier: 'free' | 'premium' | 'sponsor'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          sobriety_date?: string | null
          display_name?: string | null
          goals?: string[]
          tone_preference?: string
          triggers?: string[]
          account_tier?: 'free' | 'premium' | 'sponsor'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          sobriety_date?: string | null
          display_name?: string | null
          goals?: string[]
          tone_preference?: string
          triggers?: string[]
          account_tier?: 'free' | 'premium' | 'sponsor'
        }
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
