import { NextRequest, NextResponse } from 'next/server'
import { createServerClientAuth } from '@/lib/auth/config'
import { supabaseServer } from '@/lib/database/client'
import { z } from 'zod'

const checkSessionSchema = z.object({
  deviceFingerprint: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientAuth()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { deviceFingerprint } = checkSessionSchema.parse(body)

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

    // Проверяем есть ли активные сессии стрима
    const streamSessions = activeSessions?.filter(s => 
      s.device_info?.stream_id && s.is_active
    ) || []

    // Если есть активная сессия на другом устройстве
    if (streamSessions.length > 0 && deviceFingerprint) {
      const currentDeviceSession = streamSessions.find(s => 
        s.fingerprint_id === deviceFingerprint
      )
      
      const otherDeviceSessions = streamSessions.filter(s => 
        s.fingerprint_id !== deviceFingerprint
      )

      if (otherDeviceSessions.length > 0) {
        return NextResponse.json({
          canStream: false,
          hasActiveSession: true,
          activeDevices: otherDeviceSessions.map(s => ({
            id: s.id,
            deviceInfo: s.device_info,
            lastActivity: s.last_activity,
            streamId: s.device_info?.stream_id
          })),
          message: 'У вас уже есть активная сессия на другом устройстве'
        })
      }
    }

    return NextResponse.json({
      canStream: true,
      hasActiveSession: streamSessions.length > 0,
      currentSessions: streamSessions.map(s => ({
        id: s.id,
        deviceInfo: s.device_info,
        lastActivity: s.last_activity,
        streamId: s.device_info?.stream_id
      }))
    })

  } catch (error) {
    console.error('Error checking stream session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientAuth()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем все активные сессии пользователя
    const { data: activeSessions, error: sessionsError } = await supabaseServer
      .from('user_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('last_activity', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    const streamSessions = activeSessions?.filter(s => 
      s.device_info?.stream_id
    ) || []

    return NextResponse.json({
      totalSessions: activeSessions?.length || 0,
      streamSessions: streamSessions.length,
      sessions: activeSessions?.map(s => ({
        id: s.id,
        deviceInfo: s.device_info,
        lastActivity: s.last_activity,
        isStreaming: !!s.device_info?.stream_id,
        streamId: s.device_info?.stream_id
      })) || []
    })

  } catch (error) {
    console.error('Error getting sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}