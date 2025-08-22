'use client'

import React, { useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'
import Hls from 'hls.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  RotateCcw,
  RotateCw
} from 'lucide-react'

// Типы для видео плеера
export interface VideoPlayerProps {
  src: string
  type: 'vimeo' | 'hls' | 'mp4' | 'dacast'
  poster?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  className?: string
  width?: number
  height?: number
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onError?: (error: Error) => void
}

export interface VideoState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  isLoading: boolean
  error: string | null
}

// Компонент видео плеера
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  type,
  poster,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  className,
  width = 640,
  height = 360,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const vimeoPlayerRef = useRef<Player | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: muted,
    isFullscreen: false,
    isLoading: true,
    error: null,
  })

  // Инициализация Vimeo плеера
  const initVimeoPlayer = async () => {
    if (!containerRef.current) return

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Извлекаем ID видео из URL
      const vimeoId = extractVimeoId(src)
      if (!vimeoId) {
        throw new Error('Invalid Vimeo URL')
      }

      vimeoPlayerRef.current = new Player(containerRef.current, {
        id: parseInt(vimeoId, 10),
        autoplay,
        muted,
        loop,
        controls,
        responsive: true,
      })

      const player = vimeoPlayerRef.current

      // События плеера
      player.on('play', () => {
        setState(prev => ({ ...prev, isPlaying: true }))
        onPlay?.()
      })

      player.on('pause', () => {
        setState(prev => ({ ...prev, isPlaying: false }))
        onPause?.()
      })

      player.on('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false }))
        onEnded?.()
      })

      player.on('timeupdate', (data: any) => {
        setState(prev => ({ 
          ...prev, 
          currentTime: data.seconds,
          duration: data.duration 
        }))
        onTimeUpdate?.(data.seconds, data.duration)
      })

      player.on('volumechange', (data: any) => {
        setState(prev => ({ 
          ...prev, 
          volume: data.volume,
          isMuted: data.volume === 0 
        }))
      })

      player.on('loaded', () => {
        setState(prev => ({ ...prev, isLoading: false }))
      })

      player.on('error', (error: any) => {
        const errorMsg = `Vimeo player error: ${error.message}`
        setState(prev => ({ ...prev, error: errorMsg, isLoading: false }))
        onError?.(new Error(errorMsg))
      })

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }))
      onError?.(new Error(errorMsg))
    }
  }

  // Инициализация HLS плеера
  const initHlsPlayer = () => {
    if (!videoRef.current) return

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      if (Hls.isSupported()) {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        })

        const hls = hlsRef.current
        hls.loadSource(src)
        hls.attachMedia(videoRef.current)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setState(prev => ({ ...prev, isLoading: false }))
          if (autoplay) {
            videoRef.current?.play()
          }
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          const errorMsg = `HLS error: ${data.details}`
          setState(prev => ({ ...prev, error: errorMsg, isLoading: false }))
          onError?.(new Error(errorMsg))
        })
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Нативная поддержка HLS (Safari)
        videoRef.current.src = src
        setState(prev => ({ ...prev, isLoading: false }))
      } else {
        throw new Error('HLS is not supported in this browser')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }))
      onError?.(new Error(errorMsg))
    }
  }

  // Инициализация обычного видео
  const initVideoPlayer = () => {
    if (!videoRef.current) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    const video = videoRef.current
    video.src = src
    video.autoplay = autoplay
    video.muted = muted
    video.loop = loop
    video.controls = controls
    
    if (poster) {
      video.poster = poster
    }

    video.addEventListener('loadeddata', () => {
      setState(prev => ({ ...prev, isLoading: false }))
    })

    video.addEventListener('error', () => {
      const errorMsg = 'Video loading error'
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }))
      onError?.(new Error(errorMsg))
    })
  }

  // Инициализация плеера в зависимости от типа
  useEffect(() => {
    switch (type) {
      case 'vimeo':
        initVimeoPlayer()
        break
      case 'hls':
      case 'dacast':
        initHlsPlayer()
        break
      case 'mp4':
        initVideoPlayer()
        break
    }

    return () => {
      // Очистка ресурсов
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.destroy()
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [src, type])

  // Обработчики событий для HTML5 видео
  useEffect(() => {
    if (!videoRef.current || type === 'vimeo') return

    const video = videoRef.current

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }))
      onPlay?.()
    }

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
      onPause?.()
    }

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
      onEnded?.()
    }

    const handleTimeUpdate = () => {
      setState(prev => ({ 
        ...prev, 
        currentTime: video.currentTime,
        duration: video.duration || 0
      }))
      onTimeUpdate?.(video.currentTime, video.duration || 0)
    }

    const handleVolumeChange = () => {
      setState(prev => ({ 
        ...prev, 
        volume: video.volume,
        isMuted: video.muted
      }))
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [type, onPlay, onPause, onEnded, onTimeUpdate])

  // Управление воспроизведением
  const togglePlay = async () => {
    if (type === 'vimeo' && vimeoPlayerRef.current) {
      if (state.isPlaying) {
        await vimeoPlayerRef.current.pause()
      } else {
        await vimeoPlayerRef.current.play()
      }
    } else if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause()
      } else {
        await videoRef.current.play()
      }
    }
  }

  // Управление звуком
  const toggleMute = async () => {
    if (type === 'vimeo' && vimeoPlayerRef.current) {
      await vimeoPlayerRef.current.setVolume(state.isMuted ? state.volume : 0)
    } else if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
    }
  }

  // Перемотка
  const seek = async (time: number) => {
    if (type === 'vimeo' && vimeoPlayerRef.current) {
      await vimeoPlayerRef.current.setCurrentTime(time)
    } else if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  // Полноэкранный режим
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setState(prev => ({ ...prev, isFullscreen: true }))
    } else {
      document.exitFullscreen()
      setState(prev => ({ ...prev, isFullscreen: false }))
    }
  }

  // Форматирование времени
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (state.error) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <div className="text-red-500 mb-4">Eroare la încărcarea video</div>
        <p className="text-sm text-muted-foreground mb-4">{state.error}</p>
        <Button onClick={() => window.location.reload()}>Reîncarcă</Button>
      </Card>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('relative bg-black rounded-lg overflow-hidden w-full aspect-video', className)}
    >
      {/* Vimeo плеер рендерится автоматически */}
      {type !== 'vimeo' && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={poster}
        />
      )}
      
      {/* Индикатор загрузки */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Пользовательские элементы управления */}
      {controls && !state.isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4">
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 p-1 md:p-2"
            >
              {state.isPlaying ? <Pause className="h-3 w-3 md:h-4 md:w-4" /> : <Play className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 p-1 md:p-2"
            >
              {state.isMuted ? <VolumeX className="h-3 w-3 md:h-4 md:w-4" /> : <Volume2 className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
            
            <div className="flex-1 mx-1 md:mx-4">
              <div className="text-white text-xs md:text-sm mb-1 hidden md:block">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </div>
              <div className="w-full bg-white/20 rounded-full h-1 md:h-1.5">
                <div 
                  className="bg-white h-1 md:h-1.5 rounded-full transition-all"
                  style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
                />
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => seek(state.currentTime - 10)}
              className="text-white hover:bg-white/20 p-1 md:p-2 hidden sm:flex"
            >
              <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => seek(state.currentTime + 10)}
              className="text-white hover:bg-white/20 p-1 md:p-2 hidden sm:flex"
            >
              <RotateCw className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 p-1 md:p-2"
            >
              <Maximize className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Утилита для извлечения ID из Vimeo URL
function extractVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/)(?:.*#|.*\/videos\/|.*\/|groups\/.*\/videos\/|album\/.*\/video\/|channels\/.*\/|)(\d+)(?:\/|\?|$)/)
  return match ? match[1] : null
}

export default VideoPlayer