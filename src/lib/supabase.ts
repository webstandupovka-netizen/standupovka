import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Импортируем типы из централизованного файла
import type { Database } from '@/types/database'


// Переменные окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Клиент для браузера
export const createSupabaseBrowserClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Экспорт для клиентских компонентов
export { createSupabaseBrowserClient as createClient }

// Клиент для сервера (Server Components)
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Игнорируем ошибки при установке cookies в Server Components
          }
        },
      },
    }
  )
}

// Клиент для middleware
export const createSupabaseMiddlewareClient = (request: NextRequest) => {
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

// Типы для использования в приложении
export type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type StreamSettings = Database['public']['Tables']['stream_settings']['Row']
export type AccessLog = Database['public']['Tables']['access_logs']['Row']
export type EmailLog = Database['public']['Tables']['email_logs']['Row']