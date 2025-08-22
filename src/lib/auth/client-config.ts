// lib/auth/client-config.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}