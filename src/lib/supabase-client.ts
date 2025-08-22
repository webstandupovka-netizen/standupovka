import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { env } from './env'

// Переменные окружения
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Клиент для браузера
export const createSupabaseBrowserClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Экспорт для клиентских компонентов
export { createSupabaseBrowserClient as createClient }

// Типы для использования в приложении
export type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type StreamSettings = Database['public']['Tables']['stream_settings']['Row']
export type AccessLog = Database['public']['Tables']['access_logs']['Row']
export type EmailLog = Database['public']['Tables']['email_logs']['Row']