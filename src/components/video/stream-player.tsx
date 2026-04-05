'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VideoPart {
  token?: string
  videoId?: string
}

interface StreamPlayerProps {
  streamId: string
  isLive?: boolean
  liveEmbedUrl?: string
  poster?: string
  className?: string
}

/**
 * Универсальный видеоплеер.
 * - Live: iframe с live embed URL.
 * - VOD: Cloudflare Stream iframe (поддержка нескольких частей).
 * - Fallback: прямой URL через <video>.
 */
export function StreamPlayer({ streamId, isLive, liveEmbedUrl, poster, className }: StreamPlayerProps) {
  const [videoState, setVideoState] = useState<{
    type: 'loading' | 'cloudflare' | 'direct' | 'error'
    parts?: VideoPart[]
    url?: string
    error?: string
  }>({ type: 'loading' })

  const [activePart, setActivePart] = useState(0)

  const fetchVideoToken = useCallback(async () => {
    try {
      const res = await fetch('/api/stream/video-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setVideoState({ type: 'error', error: data.error || 'Failed to load video' })
        return
      }

      const data = await res.json()

      if (data.type === 'cloudflare' || data.type === 'cloudflare-public') {
        // Нормализуем в массив частей
        const parts: VideoPart[] = data.parts
          ? data.parts
          : [{ token: data.token, videoId: data.videoId }]
        setVideoState({ type: 'cloudflare', parts })
      } else if (data.type === 'direct') {
        setVideoState({ type: 'direct', url: data.url })
      } else {
        setVideoState({ type: 'error', error: 'No video available' })
      }
    } catch {
      setVideoState({ type: 'error', error: 'Network error' })
    }
  }, [streamId])

  useEffect(() => {
    if (!isLive) fetchVideoToken()
  }, [isLive, fetchVideoToken])

  // Обновляем токены каждые 12 минут (TTL 15 мин)
  useEffect(() => {
    if (!isLive && videoState.type === 'cloudflare') {
      const interval = setInterval(fetchVideoToken, 12 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isLive, videoState.type, fetchVideoToken])

  // Live
  if (isLive && liveEmbedUrl) {
    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden', className)}>
        <iframe
          src={liveEmbedUrl}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Live Stream"
        />
      </div>
    )
  }

  // Loading
  if (videoState.type === 'loading') {
    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden flex items-center justify-center', className)}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Se încarcă video-ul...</p>
        </div>
      </div>
    )
  }

  // Error
  if (videoState.type === 'error') {
    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden flex items-center justify-center', className)}>
        <div className="text-center text-white p-8">
          <p className="text-red-400 mb-4">{videoState.error}</p>
          <button
            onClick={fetchVideoToken}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    )
  }

  // Cloudflare Stream
  if (videoState.type === 'cloudflare' && videoState.parts?.length) {
    const parts = videoState.parts
    const current = parts[activePart]
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN || ''
    const id = current.token || current.videoId
    const embedUrl = `https://${subdomain}.cloudflarestream.com/${id}/iframe`
    const multiPart = parts.length > 1

    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden flex flex-col', className)}>
        {multiPart && (
          <div className="flex bg-black/90 border-b border-white/10 shrink-0">
            {parts.map((_, i) => (
              <button
                key={i}
                onClick={() => setActivePart(i)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium transition-colors',
                  i === activePart
                    ? 'text-white bg-white/10 border-b-2 border-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
              >
                Partea {i + 1}
              </button>
            ))}
          </div>
        )}
        <iframe
          key={activePart}
          src={embedUrl}
          className="w-full flex-1"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={multiPart ? `Video Part ${activePart + 1}` : 'Video Player'}
        />
      </div>
    )
  }

  // Direct URL fallback
  if (videoState.type === 'direct' && videoState.url) {
    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden', className)}>
        <video
          src={videoState.url}
          controls
          poster={poster}
          className="w-full h-full object-contain"
          controlsList="nodownload"
          playsInline
        />
      </div>
    )
  }

  return null
}
