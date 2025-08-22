import { NextRequest, NextResponse } from 'next/server'
import { createServerClientAuth } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/database/client'
import { z } from 'zod'

const closeSessionSchema = z.object({
  streamId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  reason: z.enum(['user_request', 'admin_action', 'session_timeout', 'device_limit']).optional().default('user_request')
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientAuth()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId, sessionId, reason } = closeSessionSchema.parse(body)

    // Получаем активные сессии пользователя
    const { data: activeSessions, error: sessionsError } = await supabaseServer
      .from('user_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    if (!activeSessions || activeSessions.length === 0) {
      return NextResponse.json({ error: 'No active sessions found' }, { status: 404 })
    }

    // Определяем какие сессии закрывать
    let sessionsToClose = activeSessions
    
    if (sessionId) {
      // Если указан sessionId, закрываем конкретную сессию
      sessionsToClose = activeSessions.filter(s => s.id === sessionId)
    } else if (streamId) {
      // Если указан streamId, закрываем только сессии для этого стрима
      sessionsToClose = activeSessions.filter(s => 
        s.device_info?.stream_id === streamId
      )
    }

    if (sessionsToClose.length === 0) {
      return NextResponse.json({ error: 'No matching sessions to close' }, { status: 404 })
    }

    // Закрываем сессии
    const sessionIds = sessionsToClose.map(s => s.id)
    const { error: updateError } = await supabaseServer
      .from('user_sessions')
      .update({
        is_active: false,
        last_activity: new Date().toISOString()
      })
      .in('id', sessionIds)

    if (updateError) {
      console.error('Error closing sessions:', updateError)
      return NextResponse.json({ error: 'Failed to close sessions' }, { status: 500 })
    }

    // Логируем закрытие сессий
    console.log(`Closed ${sessionsToClose.length} session(s) for user ${session.user.id}, reason: ${reason}`)

    // Если это запрос пользователя, также можем завершить его auth сессию
    if (reason === 'user_request') {
      // Опционально: можно добавить логику для завершения auth сессии
      // await supabase.auth.signOut()
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully closed ${sessionsToClose.length} session(s)`,
      closedSessions: sessionsToClose.length,
      reason
    })

  } catch (error) {
    console.error('Session close error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.issues 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint для получения информации об активных сессиях
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientAuth()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: activeSessions, error } = await supabaseServer
      .from('user_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({ 
      activeSessions: activeSessions || [],
      count: activeSessions?.length || 0
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}