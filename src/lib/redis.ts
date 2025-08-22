import Redis from 'ioredis'

// Конфигурация Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
}

// Создание Redis клиента
class RedisClient {
  private static instance: Redis | null = null

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(redisConfig)
      
      RedisClient.instance.on('connect', () => {
        console.log('✅ Redis connected successfully')
      })
      
      RedisClient.instance.on('error', (error: Error) => {
        console.error('❌ Redis connection error:', error)
      })
      
      RedisClient.instance.on('close', () => {
        console.log('🔌 Redis connection closed')
      })
    }
    
    return RedisClient.instance
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit()
      RedisClient.instance = null
    }
  }
}

// Экспорт экземпляра Redis
export const redis = RedisClient.getInstance()

// Утилиты для работы с сессиями
export class SessionManager {
  private static readonly SESSION_PREFIX = 'session:'
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:'
  private static readonly FINGERPRINT_PREFIX = 'fingerprint:'
  
  // Время жизни сессии (7 дней)
  private static readonly SESSION_TTL = 7 * 24 * 60 * 60 // секунды

  // Сохранить сессию
  static async saveSession(
    sessionId: string,
    userId: string,
    fingerprint: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`
    const fingerprintKey = `${this.FINGERPRINT_PREFIX}${fingerprint}`
    
    const sessionData = {
      userId,
      fingerprint,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ...data,
    }

    const pipeline = redis.pipeline()
    
    // Сохранить данные сессии
    pipeline.setex(sessionKey, this.SESSION_TTL, JSON.stringify(sessionData))
    
    // Добавить сессию к списку сессий пользователя
    pipeline.sadd(userSessionsKey, sessionId)
    pipeline.expire(userSessionsKey, this.SESSION_TTL)
    
    // Связать отпечаток с сессией
    pipeline.setex(fingerprintKey, this.SESSION_TTL, sessionId)
    
    await pipeline.exec()
  }

  // Получить сессию
  static async getSession(sessionId: string): Promise<any | null> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const sessionData = await redis.get(sessionKey)
    
    if (!sessionData) {
      return null
    }
    
    try {
      return JSON.parse(sessionData)
    } catch (error) {
      console.error('Error parsing session data:', error)
      return null
    }
  }

  // Обновить активность сессии
  static async updateSessionActivity(sessionId: string): Promise<void> {
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
    const sessionData = await this.getSession(sessionId)
    
    if (sessionData) {
      sessionData.lastActivity = new Date().toISOString()
      await redis.setex(sessionKey, this.SESSION_TTL, JSON.stringify(sessionData))
    }
  }

  // Удалить сессию
  static async deleteSession(sessionId: string): Promise<void> {
    const sessionData = await this.getSession(sessionId)
    
    if (sessionData) {
      const { userId, fingerprint } = sessionData
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`
      const fingerprintKey = `${this.FINGERPRINT_PREFIX}${fingerprint}`
      
      const pipeline = redis.pipeline()
      pipeline.del(sessionKey)
      pipeline.srem(userSessionsKey, sessionId)
      pipeline.del(fingerprintKey)
      
      await pipeline.exec()
    }
  }

  // Получить все сессии пользователя
  static async getUserSessions(userId: string): Promise<string[]> {
    const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`
    return await redis.smembers(userSessionsKey)
  }

  // Удалить все сессии пользователя
  static async deleteAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId)
    
    if (sessions.length > 0) {
      const pipeline = redis.pipeline()
      
      for (const sessionId of sessions) {
        const sessionData = await this.getSession(sessionId)
        if (sessionData) {
          const { fingerprint } = sessionData
          pipeline.del(`${this.SESSION_PREFIX}${sessionId}`)
          pipeline.del(`${this.FINGERPRINT_PREFIX}${fingerprint}`)
        }
      }
      
      pipeline.del(`${this.USER_SESSIONS_PREFIX}${userId}`)
      await pipeline.exec()
    }
  }

  // Найти сессию по отпечатку
  static async getSessionByFingerprint(fingerprint: string): Promise<string | null> {
    const fingerprintKey = `${this.FINGERPRINT_PREFIX}${fingerprint}`
    return await redis.get(fingerprintKey)
  }

  // Очистить истекшие сессии (можно вызывать периодически)
  static async cleanupExpiredSessions(): Promise<void> {
    // Redis автоматически удаляет истекшие ключи,
    // но можно добавить дополнительную логику очистки
    console.log('Cleanup expired sessions completed')
  }
}

// Утилиты для кэширования
export class CacheManager {
  private static readonly CACHE_PREFIX = 'cache:'
  
  // Сохранить в кэш
  static async set(
    key: string,
    value: any,
    ttl: number = 3600 // 1 час по умолчанию
  ): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`
    await redis.setex(cacheKey, ttl, JSON.stringify(value))
  }

  // Получить из кэша
  static async get<T = any>(key: string): Promise<T | null> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`
    const cachedData = await redis.get(cacheKey)
    
    if (!cachedData) {
      return null
    }
    
    try {
      return JSON.parse(cachedData) as T
    } catch (error) {
      console.error('Error parsing cached data:', error)
      return null
    }
  }

  // Удалить из кэша
  static async delete(key: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`
    await redis.del(cacheKey)
  }

  // Удалить по паттерну
  static async deletePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(`${this.CACHE_PREFIX}${pattern}`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  // Проверить существование ключа
  static async exists(key: string): Promise<boolean> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`
    return (await redis.exists(cacheKey)) === 1
  }

  // Установить TTL для существующего ключа
  static async expire(key: string, ttl: number): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${key}`
    await redis.expire(cacheKey, ttl)
  }
}

export default redis