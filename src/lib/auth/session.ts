// lib/auth/session.ts
import { supabaseServer, redis } from '@/lib/database/client'
import type { UserSession } from '@/types/database'

export class SessionManager {
  private static REDIS_PREFIX = 'session:'
  private static SESSION_DURATION = 24 * 60 * 60 // 24 hours

  static async createSession(
    userId: string,
    fingerprintId: string,
    deviceInfo: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserSession> {
    // Деактивируем все старые сессии пользователя
    await this.deactivateUserSessions(userId)

    // Создаем новую сессию
    const session = {
      user_id: userId,
      fingerprint_id: fingerprintId,
      device_info: deviceInfo,
      ip_address: ipAddress,
      user_agent: userAgent,
      is_active: true,
      expires_at: new Date(Date.now() + this.SESSION_DURATION * 1000).toISOString()
    }

    const { data, error } = await supabaseServer
      .from('user_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error

    // Сохраняем в Redis для быстрого доступа
    await redis.setex(
      `${this.REDIS_PREFIX}${data.id}`,
      this.SESSION_DURATION,
      JSON.stringify(data)
    )

    return data
  }

  static async validateSession(sessionId: string): Promise<{
    isValid: boolean
    session?: UserSession
  }> {
    try {
      // Сначала проверяем в Redis
      const cached = await redis.get(`${this.REDIS_PREFIX}${sessionId}`)
      if (cached) {
        const session = JSON.parse(cached as string)
        if (session.is_active && new Date(session.expires_at) > new Date()) {
          await this.updateLastActivity(sessionId)
          return { isValid: true, session }
        }
      }

      // Проверяем в базе данных
      const { data: session, error } = await supabaseServer
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single()

      if (error || !session) {
        return { isValid: false }
      }

      // Проверяем время истечения
      if (new Date(session.expires_at!) < new Date()) {
        await this.deactivateSession(sessionId)
        return { isValid: false }
      }

      await this.updateLastActivity(sessionId)
      return { isValid: true, session }
    } catch (error) {
      return { isValid: false }
    }
  }

  static async updateLastActivity(sessionId: string): Promise<void> {
    const now = new Date().toISOString()
    
    await supabaseServer
      .from('user_sessions')
      .update({ last_activity: now })
      .eq('id', sessionId)

    // Обновляем в Redis
    const cached = await redis.get(`${this.REDIS_PREFIX}${sessionId}`)
    if (cached) {
      const session = JSON.parse(cached as string)
      session.last_activity = now
      await redis.setex(
        `${this.REDIS_PREFIX}${sessionId}`,
        this.SESSION_DURATION,
        JSON.stringify(session)
      )
    }
  }

  static async deactivateSession(sessionId: string): Promise<void> {
    await supabaseServer
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)

    await redis.del(`${this.REDIS_PREFIX}${sessionId}`)
  }

  static async deactivateUserSessions(userId: string): Promise<void> {
    const { data: sessions } = await supabaseServer
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (sessions) {
      await Promise.all([
        supabaseServer
          .from('user_sessions')
          .update({ is_active: false })
          .eq('user_id', userId),
        ...sessions.map((session: { id: string }) => 
          redis.del(`${this.REDIS_PREFIX}${session.id}`)
        )
      ])
    }
  }

  static async getActiveSessionsCount(userId: string): Promise<number> {
    const { count } = await supabaseServer
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    return count || 0
  }
}