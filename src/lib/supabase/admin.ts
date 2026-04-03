import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Клиент с service_role key — обходит RLS.
// Использовать ТОЛЬКО в серверном коде: API routes, webhooks, admin endpoints.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
