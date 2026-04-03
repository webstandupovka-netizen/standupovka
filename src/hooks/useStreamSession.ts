'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const HEARTBEAT_INTERVAL = 30 * 1000 // 30 секунд

interface StreamSessionState {
  status: 'idle' | 'starting' | 'active' | 'blocked' | 'error'
  sessionId: string | null
  error: string | null
}

export function useStreamSession(streamId: string | null) {
  const [state, setState] = useState<StreamSessionState>({
    status: 'idle',
    sessionId: null,
    error: null,
  })
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  const startSession = useCallback(async () => {
    if (!streamId) return

    setState(prev => ({ ...prev, status: 'starting', error: null }))

    try {
      const res = await fetch('/api/stream/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', streamId }),
      })

      const data = await res.json()

      if (!res.ok || !data.allowed) {
        setState({
          status: 'blocked',
          sessionId: null,
          error: data.error || 'Sesiune activă pe alt dispozitiv',
        })
        return
      }

      sessionIdRef.current = data.sessionId
      setState({ status: 'active', sessionId: data.sessionId, error: null })
    } catch {
      setState({ status: 'error', sessionId: null, error: 'Network error' })
    }
  }, [streamId])

  // Heartbeat — каждые 30 сек
  useEffect(() => {
    if (state.status !== 'active' || !state.sessionId) return

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/stream/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'heartbeat', sessionId: state.sessionId }),
        })
      } catch {
        // Молча игнорируем — следующий heartbeat попробует снова
      }
    }

    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [state.status, state.sessionId])

  // End session при уходе со страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        navigator.sendBeacon(
          '/api/stream/session',
          JSON.stringify({ action: 'end', sessionId: sessionIdRef.current })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Cleanup при unmount
      if (sessionIdRef.current) {
        fetch('/api/stream/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'end', sessionId: sessionIdRef.current }),
          keepalive: true,
        }).catch(() => {})
      }
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [])

  const forceClose = useCallback(async (activeSessionId: string) => {
    try {
      await fetch('/api/stream/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', sessionId: activeSessionId }),
      })
      // После закрытия — пробуем начать заново
      await startSession()
    } catch {
      setState(prev => ({ ...prev, error: 'Nu s-a putut închide sesiunea' }))
    }
  }, [startSession])

  return {
    ...state,
    startSession,
    forceClose,
  }
}
