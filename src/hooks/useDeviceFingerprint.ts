'use client'

import { useState, useEffect } from 'react'
import { FingerprintService } from '@/lib/auth/fingerprint'

export default function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getFingerprint = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const service = FingerprintService.getInstance()
        const fp = await service.getFingerprint()
        setFingerprint(fp.visitorId)
      } catch (err) {
        console.error('Error generating device fingerprint:', err)
        setError(err instanceof Error ? err.message : 'Failed to generate fingerprint')
      } finally {
        setLoading(false)
      }
    }

    getFingerprint()
  }, [])

  return {
    fingerprint,
    loading,
    error
  }
}