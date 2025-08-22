// lib/auth/fingerprint.ts
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { useEffect, useState } from 'react'

export interface DeviceFingerprint {
  visitorId: string
  confidence: number
  components: {
    screen: any
    timezone: any
    language: any
    platform: any
    userAgent: any
  }
}

export class FingerprintService {
  private static instance: FingerprintService
  private fp: any = null

  private constructor() {}

  static getInstance(): FingerprintService {
    if (!FingerprintService.instance) {
      FingerprintService.instance = new FingerprintService()
    }
    return FingerprintService.instance
  }

  async initialize(): Promise<void> {
    if (!this.fp) {
      this.fp = await FingerprintJS.load()
    }
  }

  async getFingerprint(): Promise<DeviceFingerprint> {
    if (!this.fp) {
      await this.initialize()
    }

    const result = await this.fp.get()
    
    return {
      visitorId: result.visitorId,
      confidence: result.confidence.score,
      components: {
        screen: result.components.screen,
        timezone: result.components.timezone,
        language: result.components.language,
        platform: result.components.platform,
        userAgent: result.components.userAgent
      }
    }
  }

  async validateDevice(userId: string): Promise<{
    isValid: boolean
    existingSession?: any
    error?: string
  }> {
    try {
      const fingerprint = await this.getFingerprint()
      
      // Проверяем активные сессии пользователя
      const response = await fetch('/api/auth/validate-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fingerprintId: fingerprint.visitorId,
          deviceInfo: fingerprint.components
        })
      })

      return await response.json()
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate device'
      }
    }
  }
}

// Custom hook для использования в компонентах
export function useDeviceValidation() {
  const [isValidating, setIsValidating] = useState(false)
  const [isValidDevice, setIsValidDevice] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateDevice = async (userId: string) => {
    setIsValidating(true)
    setError(null)

    try {
      const fingerprintService = FingerprintService.getInstance()
      const result = await fingerprintService.validateDevice(userId)
      
      setIsValidDevice(result.isValid)
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Device validation failed')
      setIsValidDevice(false)
    } finally {
      setIsValidating(false)
    }
  }

  return { isValidating, isValidDevice, error, validateDevice }
}