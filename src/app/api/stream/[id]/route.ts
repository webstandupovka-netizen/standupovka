import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Поля, безопасные для отдачи без авторизации
const PUBLIC_FIELDS = [
  'id', 'title', 'description', 'poster_url',
  'stream_start_time', 'stream_end_time',
  'price', 'currency', 'is_live', 'is_active'
] as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: streamData, error } = await supabase
      .from('stream_settings')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !streamData) {
      return NextResponse.json(
        { error: 'Stream not found or inactive' },
        { status: 404 }
      )
    }

    // Проверяем авторизацию — если есть сессия, отдаём полные данные
    const authSupabase = await createServerClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (user) {
      return NextResponse.json(streamData)
    }

    // Без авторизации — только публичные поля (без RTMP ключей, URL записей и т.д.)
    const publicData: Record<string, any> = {}
    for (const field of PUBLIC_FIELDS) {
      if (field in streamData) {
        publicData[field] = (streamData as any)[field]
      }
    }

    return NextResponse.json(publicData)
  } catch (error) {
    console.error('Error fetching stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
