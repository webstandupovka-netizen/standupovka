import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000 // 2 минуты — сессия считается мёртвой

// POST — начать сессию просмотра
const startSchema = z.object({
  streamId: z.string().uuid(),
  action: z.literal('start'),
})

// PATCH — heartbeat (продлить сессию)
const heartbeatSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.literal('heartbeat'),
})

// DELETE-like — завершить сессию
const endSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.literal('end'),
})

const actionSchema = z.discriminatedUnion('action', [startSchema, heartbeatSchema, endSchema])

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = actionSchema.parse(body)

    // === START SESSION ===
    if (parsed.action === 'start') {
      const cutoff = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS).toISOString()

      // Проверяем живые сессии для этого стрима
      const { data: liveSessions } = await supabaseAdmin
        .from('user_sessions')
        .select('id, heartbeat_at')
        .eq('user_id', user.id)
        .eq('stream_id', parsed.streamId)
        .eq('is_active', true)
        .gte('heartbeat_at', cutoff)

      if (liveSessions && liveSessions.length > 0) {
        return NextResponse.json({
          allowed: false,
          error: 'Aveți deja o sesiune activă pe alt dispozitiv',
          activeSession: liveSessions[0].id
        }, { status: 409 })
      }

      // Деактивируем старые мёртвые сессии этого пользователя для этого стрима
      await supabaseAdmin
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('stream_id', parsed.streamId)
        .eq('is_active', true)
        .lt('heartbeat_at', cutoff)

      // Создаём новую сессию
      const { data: session, error } = await supabaseAdmin
        .from('user_sessions')
        .insert({
          user_id: user.id,
          stream_id: parsed.streamId,
          fingerprint_id: 'heartbeat',
          device_info: {
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          is_active: true,
          heartbeat_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) {
        console.error('Failed to create session:', error)
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
      }

      return NextResponse.json({ allowed: true, sessionId: session.id })
    }

    // === HEARTBEAT ===
    if (parsed.action === 'heartbeat') {
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .update({
          heartbeat_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
        })
        .eq('id', parsed.sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      return NextResponse.json({ ok: true })
    }

    // === END SESSION ===
    if (parsed.action === 'end') {
      await supabaseAdmin
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', parsed.sessionId)
        .eq('user_id', user.id)

      return NextResponse.json({ ok: true })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('Session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
