import { supabaseAdmin } from '@/lib/supabase/admin'
import type { UserSession } from '@/types/database'

export class SessionManager {
  private static SESSION_DURATION = 24 * 60 * 60 // 24 hours

  static async createSession(
    userId: string,
    fingerprintId: string,
    deviceInfo: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserSession> {
    const session = {
      user_id: userId,
      fingerprint_id: fingerprintId,
      device_info: deviceInfo,
      ip_address: ipAddress,
      user_agent: userAgent,
      is_active: true,
      expires_at: new Date(Date.now() + this.SESSION_DURATION * 1000).toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('user_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async validateSession(sessionId: string): Promise<{
    isValid: boolean
    session?: UserSession
  }> {
    try {
      const { data: session, error } = await supabaseAdmin
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single()

      if (error || !session) {
        return { isValid: false }
      }

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
    await supabaseAdmin
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', sessionId)
  }

  static async deactivateSession(sessionId: string): Promise<void> {
    await supabaseAdmin
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
  }

  static async getActiveSessionsCount(userId: string): Promise<number> {
    const { count } = await supabaseAdmin
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    return count || 0
  }
}
