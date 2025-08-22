import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Типы для базы данных
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          user_id: string
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          user_id: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          user_id?: string
          updated_at?: string
          due_date?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          fingerprint: string
          created_at: string
          expires_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          fingerprint: string
          created_at?: string
          expires_at: string
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          fingerprint?: string
          expires_at?: string
          last_activity?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Клиент для middleware
export const createSupabaseMiddlewareClient = (request: NextRequest) => {
  // Получаем переменные окружения напрямую в middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://npxqxjrunqroavlzvdce.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHF4anJ1bnFyb2F2bHp2ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDMyNjksImV4cCI6MjA2OTg3OTI2OX0.XQfiVXttJb1ZP6-71zazAYnuf4hyuf-EQ7s9wXMr3OI'

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}