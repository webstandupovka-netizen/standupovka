import FingerprintJS from '@fingerprintjs/fingerprintjs'

// Интерфейс для результата отпечатка
export interface FingerprintResult {
  visitorId: string
  confidence: {
    score: number
    comment?: string
  }
  components: Record<string, any>
}

// Класс для работы с отпечатками браузера
export class BrowserFingerprint {
  private static fpPromise: Promise<any> | null = null

  // Инициализация FingerprintJS
  private static async initFingerprint() {
    if (!this.fpPromise) {
      this.fpPromise = FingerprintJS.load()
    }
    return this.fpPromise
  }

  // Получить отпечаток браузера
  static async getFingerprint(): Promise<FingerprintResult> {
    try {
      const fp = await this.initFingerprint()
      const result = await fp.get()
      
      return {
        visitorId: result.visitorId,
        confidence: result.confidence || { score: 0.5 },
        components: result.components || {},
      }
    } catch (error) {
      console.error('Error getting fingerprint:', error)
      // Возвращаем fallback отпечаток
      return this.getFallbackFingerprint()
    }
  }

  // Получить упрощенный отпечаток (fallback)
  private static getFallbackFingerprint(): FingerprintResult {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Простой canvas fingerprint
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Browser fingerprint fallback', 2, 2)
    }
    
    const canvasFingerprint = canvas.toDataURL()
    
    // Собираем базовую информацию
    const basicInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint,
    }
    
    // Создаем простой хэш
    const fingerprint = this.simpleHash(JSON.stringify(basicInfo))
    
    return {
      visitorId: fingerprint,
      confidence: { score: 0.3, comment: 'Fallback fingerprint' },
      components: basicInfo,
    }
  }

  // Простая хэш-функция
  private static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Конвертируем в 32-битное число
    }
    return Math.abs(hash).toString(36)
  }

  // Проверить, изменился ли отпечаток
  static async hasChanged(storedFingerprint: string): Promise<boolean> {
    try {
      const current = await this.getFingerprint()
      return current.visitorId !== storedFingerprint
    } catch (error) {
      console.error('Error checking fingerprint change:', error)
      return false
    }
  }

  // Получить дополнительную информацию о браузере
  static getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      webdriver: (navigator as any).webdriver,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
      },
      timezone: {
        name: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: new Date().getTimezoneOffset(),
      },
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
      } : null,
    }
  }

  // Сохранить отпечаток в localStorage
  static saveFingerprint(fingerprint: string): void {
    try {
      localStorage.setItem('browser_fingerprint', fingerprint)
      localStorage.setItem('fingerprint_timestamp', Date.now().toString())
    } catch (error) {
      console.error('Error saving fingerprint to localStorage:', error)
    }
  }

  // Получить сохраненный отпечаток
  static getSavedFingerprint(): { fingerprint: string | null; timestamp: number | null } {
    try {
      const fingerprint = localStorage.getItem('browser_fingerprint')
      const timestamp = localStorage.getItem('fingerprint_timestamp')
      
      return {
        fingerprint,
        timestamp: timestamp ? parseInt(timestamp) : null,
      }
    } catch (error) {
      console.error('Error getting saved fingerprint:', error)
      return { fingerprint: null, timestamp: null }
    }
  }

  // Очистить сохраненный отпечаток
  static clearSavedFingerprint(): void {
    try {
      localStorage.removeItem('browser_fingerprint')
      localStorage.removeItem('fingerprint_timestamp')
    } catch (error) {
      console.error('Error clearing saved fingerprint:', error)
    }
  }

  // Проверить, нужно ли обновить отпечаток (например, раз в день)
  static shouldUpdateFingerprint(maxAge: number = 24 * 60 * 60 * 1000): boolean {
    const { timestamp } = this.getSavedFingerprint()
    
    if (!timestamp) {
      return true
    }
    
    return Date.now() - timestamp > maxAge
  }
}

// Хук для использования в React компонентах
export const useFingerprint = () => {
  const [fingerprint, setFingerprint] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const getFingerprint = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Сначала проверяем сохраненный отпечаток
        const saved = BrowserFingerprint.getSavedFingerprint()
        
        if (saved.fingerprint && !BrowserFingerprint.shouldUpdateFingerprint()) {
          setFingerprint(saved.fingerprint)
          setLoading(false)
          return
        }
        
        // Получаем новый отпечаток
        const result = await BrowserFingerprint.getFingerprint()
        setFingerprint(result.visitorId)
        
        // Сохраняем новый отпечаток
        BrowserFingerprint.saveFingerprint(result.visitorId)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    getFingerprint()
  }, [])

  return { fingerprint, loading, error }
}

// Импорт React для хука
import React from 'react'

export default BrowserFingerprint