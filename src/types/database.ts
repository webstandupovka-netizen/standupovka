// types/database.ts
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
      user_sessions: {
        Row: UserSession
        Insert: Omit<UserSession, 'id' | 'created_at'>
        Update: Partial<Omit<UserSession, 'id' | 'created_at'>>
      }
      stream_settings: {
        Row: StreamSettings
        Insert: Omit<StreamSettings, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<StreamSettings, 'id' | 'created_at'>>
      }
      access_logs: {
        Row: AccessLog
        Insert: Omit<AccessLog, 'id' | 'created_at'>
        Update: never
      }
      email_logs: {
        Row: EmailLog
        Insert: Omit<EmailLog, 'id' | 'created_at'>
        Update: Partial<Omit<EmailLog, 'id' | 'created_at'>>
      }
    }
  }
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  free_access: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  maib_transaction_id?: string
  maib_order_id?: string
  payment_method?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  fingerprint_id: string
  device_info: Record<string, any>
  ip_address?: string
  user_agent?: string
  is_active: boolean
  last_activity: string
  expires_at?: string
  created_at: string
}

export interface StreamSettings {
  id: string
  title: string
  description?: string
  dacast_content_id?: string
  dacast_embed_url?: string
  dacast_rtmp_url?: string
  dacast_stream_key?: string
  castr_stream_id?: string
  castr_embed_url?: string
  castr_rtmp_url?: string
  castr_stream_key?: string
  castr_playback_url?: string
  poster_url?: string
  stream_start_time: string
  stream_end_time?: string
  price: number
  currency: string
  is_live: boolean
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AccessLog {
  id: string
  user_id?: string
  session_id?: string
  action: string
  resource?: string
  ip_address?: string
  user_agent?: string
  metadata: Record<string, any>
  created_at: string
}

export interface EmailLog {
  id: string
  user_id?: string
  email_type: string
  recipient_email: string
  subject?: string
  status: 'sent' | 'delivered' | 'failed' | 'bounced'
  provider_id?: string
  metadata: Record<string, any>
  created_at: string
}