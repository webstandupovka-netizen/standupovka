'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface StreamPlayerProps {
  streamId: string
  isLive?: boolean
  liveEmbedUrl?: string
  poster?: string
  className?: string
}

/**
 * Универсальный видеоплеер.
 * - Live: показывает iframe с live embed URL (Castr/Cloudflare).
 * - VOD: запрашивает signed token через API → показывает Cloudflare Stream iframe.
 * - Fallback: прямой URL через <video> тег (для старых записей).
 */
export function StreamPlayer({ streamId, isLive, liveEmbedUrl, poster, className }: StreamPlayerProps) {
  const [videoState, setVideoState] = useState<{
    type: 'loading' | 'cloudflare' | 'direct' | 'error'
    token?: string
    videoId?: string
    url?: string
    error?: string
  }>({ type: 'loading' })

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

      if (data.type === 'cloudflare') {
        setVideoState({ type: 'cloudflare', token: data.token, videoId: data.videoId })
      } else if (data.type === 'cloudflare-public') {
        setVideoState({ type: 'cloudflare', videoId: data.videoId })
      } else if (data.type === 'direct') {
        setVideoState({ type: 'direct', url: data.url })
      } else {
        setVideoState({ type: 'error', error: 'No video available' })
      }
    } catch {
      setVideoState({ type: 'error', error: 'Network error' })
    }
  }, [streamId])

  // Для VOD: загружаем signed token
  useEffect(() => {
    if (!isLive) {
      fetchVideoToken()
    }
  }, [isLive, fetchVideoToken])

  // Для VOD: обновляем token каждые 12 минут (TTL 15 мин, обновляем заранее)
  useEffect(() => {
    if (!isLive && videoState.type === 'cloudflare') {
      const interval = setInterval(fetchVideoToken, 12 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isLive, videoState.type, fetchVideoToken])

  // Live стрим — iframe с embed URL
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

  // Cloudflare Stream — iframe (signed token или public videoId)
  if (videoState.type === 'cloudflare' && (videoState.token || videoState.videoId)) {
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN || ''
    const id = videoState.token || videoState.videoId
    const embedUrl = `https://${subdomain}.cloudflarestream.com/${id}/iframe`

    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden', className)}>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Video Player"
        />
      </div>
    )
  }

  // Direct URL fallback — для старых записей
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
