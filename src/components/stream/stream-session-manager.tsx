'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Monitor, X, Loader2, Play } from 'lucide-react'
import useDeviceFingerprint from '../../hooks/useDeviceFingerprint'

interface ActiveDevice {
  id: string
  deviceInfo: any
  lastActivity: string
  streamId?: string
}

interface StreamSessionManagerProps {
  onCanStream: (canStream: boolean) => void
  onStreamStart?: () => void
  className?: string
}

export function StreamSessionManager({ 
  onCanStream, 
  onStreamStart,
  className = '' 
}: StreamSessionManagerProps) {
  const [checking, setChecking] = useState(true)
  const [canStream, setCanStream] = useState(false)
  const [hasActiveSession, setHasActiveSession] = useState(false)
  const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>([])
  const [closingSession, setClosingSession] = useState<string | null>(null)
  const { fingerprint } = useDeviceFingerprint()

  const checkStreamSession = useCallback(async () => {
    if (!fingerprint) return
    
    setChecking(true)
    try {
      const response = await fetch('/api/stream/check-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceFingerprint: fingerprint
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check session')
      }

      setCanStream(data.canStream)
      setHasActiveSession(data.hasActiveSession)
      setActiveDevices(data.activeDevices || [])
      onCanStream(data.canStream)

    } catch (error) {
      console.error('Error checking stream session:', error)
      setCanStream(false)
      onCanStream(false)
    } finally {
      setChecking(false)
    }
  }, [fingerprint])

  useEffect(() => {
    if (fingerprint) {
      checkStreamSession()
    }
  }, [fingerprint, checkStreamSession])

  const closeSessionOnDevice = async (sessionId: string) => {
    setClosingSession(sessionId)
    try {
      const response = await fetch('/api/stream/close-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          reason: 'device_limit'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close session')
      }

      // Перепроверяем сессии после закрытия
      await checkStreamSession()

    } catch (error) {
      console.error('Error closing session:', error)
    } finally {
      setClosingSession(null)
    }
  }

  const handleStartStream = () => {
    if (canStream && onStreamStart) {
      onStreamStart()
    }
  }

  if (checking) {
    return (
      <Button 
        disabled
        className="w-full bg-[#666666] text-white cursor-not-allowed"
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Se verifică...
      </Button>
    )
  }

  if (!canStream && hasActiveSession && activeDevices.length > 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="bg-[#D61515]/10 border border-[#D61515]/30 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-[#D61515] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[#F2F2F2] text-sm font-medium mb-1">
                Sesiune activă pe alt dispozitiv
              </p>
              <p className="text-[#CCCCCC] text-xs mb-3">
                Pentru a începe transmisia pe acest dispozitiv, închideți sesiunea de pe celălalt dispozitiv.
              </p>
              
              <div className="space-y-2">
                {activeDevices.map((device) => (
                  <div 
                    key={device.id} 
                    className="flex items-center justify-between bg-[#0A0A0A] border border-[#333333] rounded-lg p-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-3 w-3 text-[#CCCCCC]" />
                      <div>
                        <p className="text-xs font-medium text-[#F2F2F2]">
                          {device.deviceInfo?.browser || 'Browser necunoscut'} pe {device.deviceInfo?.os || 'SO necunoscut'}
                        </p>
                        <p className="text-xs text-[#CCCCCC]">
                          {new Date(device.lastActivity).toLocaleString('ro-RO')}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeSessionOnDevice(device.id)}
                      disabled={closingSession === device.id}
                      className="text-[#D61515] border-[#D61515]/30 hover:bg-[#D61515]/10 h-6 px-2"
                    >
                      {closingSession === device.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={checkStreamSession}
                variant="outline"
                size="sm"
                className="mt-2 w-full border-[#333333] text-[#F2F2F2] hover:bg-[#333333] h-8"
              >
                Actualizează statusul
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (canStream) {
    return (
      <Button 
        onClick={handleStartStream}
        className="w-full bg-[#10C23F] hover:bg-[#0EA235] text-white transition-all duration-200"
      >
        Început transmisie
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleStartStream}
      className="w-full bg-[#10C23F] hover:bg-[#0EA235] text-white transition-all duration-200"
    >
      Început transmisie
    </Button>
  )
}