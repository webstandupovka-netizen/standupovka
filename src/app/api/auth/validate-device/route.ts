// app/api/auth/validate-device/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/database/client'
import { SessionManager } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { userId, fingerprintId, deviceInfo } = await request.json()

    if (!userId || !fingerprintId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Проверяем существующие активные сессии пользователя
    const { data: existingSessions } = await supabaseServer
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    // Проверяем, есть ли уже сессия с таким же отпечатком
    const existingSession = existingSessions?.find(
      session => session.fingerprint_id === fingerprintId
    )

    if (existingSession) {
      // Обновляем активность существующей сессии
      await SessionManager.updateLastActivity(existingSession.id)
      return NextResponse.json({
        isValid: true,
        existingSession
      })
    }

    // Проверяем лимит активных сессий (максимум 3 устройства)
    const activeSessionsCount = await SessionManager.getActiveSessionsCount(userId)
    
    if (activeSessionsCount >= 3) {
      return NextResponse.json({
        isValid: false,
        error: 'Maximum number of active devices reached'
      })
    }

    // Создаем новую сессию
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const newSession = await SessionManager.createSession(
      userId,
      fingerprintId,
      deviceInfo,
      ipAddress,
      userAgent
    )

    return NextResponse.json({
      isValid: true,
      session: newSession
    })

  } catch (error) {
    console.error('Device validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}