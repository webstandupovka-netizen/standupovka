import { SupabaseClient } from '@supabase/supabase-js'

export type AccessResult = {
  hasAccess: boolean
  reason: 'free_access' | 'paid' | 'no_access'
}

/**
 * Проверяет доступ пользователя к конкретному стриму.
 * Использовать с browser-клиентом (клиентские компоненты).
 *
 * Логика:
 * 1. Если user_profiles.free_access = true → доступ есть
 * 2. Если есть completed-платёж с metadata.stream_id → доступ есть
 * 3. Иначе → доступа нет
 */
export async function checkStreamAccess(
  supabase: SupabaseClient,
  userId: string,
  streamId: string
): Promise<AccessResult> {
  // Проверяем бесплатный доступ
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('free_access')
    .eq('id', userId)
    .single()

  if (profile?.free_access) {
    return { hasAccess: true, reason: 'free_access' }
  }

  // Проверяем оплату для конкретного стрима
  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .contains('metadata', { stream_id: streamId })
    .single()

  if (payment) {
    return { hasAccess: true, reason: 'paid' }
  }

  return { hasAccess: false, reason: 'no_access' }
}
