import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CloudflareStreamService } from '@/lib/cloudflare-stream'
import { z } from 'zod'

const tokenSchema = z.object({
  streamId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Проверяем авторизацию
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId } = tokenSchema.parse(body)

    // 2. Проверяем доступ к стриму
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('free_access')
      .eq('id', user.id)
      .single()

    let hasAccess = false

    if (profile?.free_access) {
      hasAccess = true
    } else {
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .contains('metadata', { stream_id: streamId })
        .single()

      hasAccess = !!payment
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // 3. Получаем cf_video_id из stream_settings
    const { data: stream } = await supabaseAdmin
      .from('stream_settings')
      .select('cf_video_id, recorded_video_url')
      .eq('id', streamId)
      .single()

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // 4. Если есть Cloudflare video — генерируем signed token
    if (stream.cf_video_id) {
      const token = CloudflareStreamService.createSignedToken(stream.cf_video_id, 900) // 15 мин
      return NextResponse.json({
        type: 'cloudflare',
        token,
        videoId: stream.cf_video_id,
      })
    }

    // 5. Fallback — прямой URL (для старых записей до миграции на Cloudflare)
    if (stream.recorded_video_url) {
      return NextResponse.json({
        type: 'direct',
        url: stream.recorded_video_url,
      })
    }

    return NextResponse.json({ error: 'No video available' }, { status: 404 })

  } catch (error) {
    console.error('Video token error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
