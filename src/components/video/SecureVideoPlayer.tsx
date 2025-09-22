'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
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
  RotateCw,
  Download,
  X
} from 'lucide-react'

export interface SecureVideoPlayerProps {
  src: string
  poster?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  className?: string
  userEmail?: string
  title?: string
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
  showSettings: boolean
  selectedQuality: string
  availableQualities: string[]
  showControls: boolean
  videoSources: Record<string, string>
}

// Компонент защищенного видео плеера
export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  src,
  poster,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  className,
  userEmail,
  title = 'Înregistrarea stream-ului',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Определение устройства для выбора качества по умолчанию
  const getDefaultQuality = () => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      return isMobile ? '480p' : '1080p'
    }
    return '1080p'
  }

  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: muted,
    isFullscreen: false,
    isLoading: true,
    error: null,
    showSettings: false,
    selectedQuality: getDefaultQuality(),
    availableQualities: ['1080p', '720p', '480p'],
    showControls: true,
    videoSources: {
      '1080p': 'https://line.mediashowgrup.md/stand_1080.mp4',
      '720p': 'https://line.mediashowgrup.md/stand_720.mp4',
      '480p': 'https://line.mediashowgrup.md/stand_480.mp4'
    }
  })

  // Защита от скачивания - отключение контекстного меню
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }, [])

  // Защита от горячих клавиш
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Блокируем Ctrl+S, Ctrl+Shift+I, F12, Ctrl+U и другие
    if (
      (e.ctrlKey && (e.key === 's' || e.key === 'u')) ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      e.key === 'F12'
    ) {
      e.preventDefault()
      return false
    }
  }, [])

  // Защита от перетаскивания
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    return false
  }, [])

  // Инициализация видео плеера
  const initVideoPlayer = useCallback(() => {
    if (!videoRef.current) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    const video = videoRef.current
    // Используем источник видео в зависимости от выбранного качества
    const videoSource = state.videoSources[state.selectedQuality] || src
    video.src = videoSource
    video.autoplay = autoplay
    video.muted = muted
    video.loop = loop
    video.controls = false // Отключаем стандартные контролы
    video.disablePictureInPicture = true
    
    if (poster) {
      video.poster = poster
    }

    // Защита от скачивания через атрибуты
    video.setAttribute('controlslist', 'nodownload')
    video.setAttribute('disablepictureinpicture', 'true')
    video.setAttribute('oncontextmenu', 'return false')

    video.addEventListener('loadeddata', () => {
      setState(prev => ({ ...prev, isLoading: false }))
    })

    video.addEventListener('error', () => {
      const errorMsg = 'Eroare la încărcarea video-ului'
      setState(prev => ({ ...prev, error: errorMsg, isLoading: false }))
      onError?.(new Error(errorMsg))
    })
  }, [src, autoplay, muted, loop, poster, onError, state.selectedQuality, state.videoSources])

  // Обработчики событий для HTML5 видео
  useEffect(() => {
    if (!videoRef.current) return

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
  }, [onPlay, onPause, onEnded, onTimeUpdate])

  // Инициализация плеера
  useEffect(() => {
    initVideoPlayer()
    
    // Добавляем глобальные обработчики для защиты
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [initVideoPlayer, handleKeyDown])

  // Управление воспроизведением
  const togglePlay = async () => {
    if (!videoRef.current) return
    
    if (state.isPlaying) {
      videoRef.current.pause()
    } else {
      try {
        await videoRef.current.play()
      } catch (error) {
        console.error('Ошибка воспроизведения:', error)
      }
    }
  }

  // Управление звуком
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
  }

  // Изменение громкости
  const setVolume = (volume: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = Math.max(0, Math.min(1, volume))
  }

  // Перемотка
  const seek = (time: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(state.duration, time))
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

  // Переключение настроек
  const toggleSettings = () => {
    setState(prev => ({ ...prev, showSettings: !prev.showSettings }))
  }

  // Schimbarea calității cu păstrarea poziției
  const changeQuality = (quality: string) => {
    if (!videoRef.current || !state.videoSources[quality]) return
    
    const currentTime = videoRef.current.currentTime
    const wasPlaying = !videoRef.current.paused
    
    setState(prev => ({ ...prev, selectedQuality: quality, showSettings: false, isLoading: true }))
    
    // Schimbăm sursa video
    videoRef.current.src = state.videoSources[quality]
    
    // Restaurăm poziția și starea de redare
    const handleLoadedData = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime
        setState(prev => ({ ...prev, isLoading: false }))
        
        if (wasPlaying) {
          videoRef.current.play().catch(console.error)
        }
        
        videoRef.current.removeEventListener('loadeddata', handleLoadedData)
      }
    }
    
    videoRef.current.addEventListener('loadeddata', handleLoadedData)
  }

  // Gestionarea mouse-ului pentru ascunderea controalelor
  const handleMouseEnter = () => {
    setState(prev => ({ ...prev, showControls: true }))
  }

  const handleMouseLeave = () => {
    setState(prev => ({ ...prev, showControls: false }))
  }

  // Formatarea timpului
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }

  // Обработка клика по прогресс-бару
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const percentage = clickX / width
    const newTime = percentage * state.duration
    
    seek(newTime)
  }

  if (state.error) {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <div className="text-red-500 mb-4">Eroare la încărcarea video-ului</div>
        <p className="text-sm text-muted-foreground mb-4">{state.error}</p>
        <Button onClick={() => window.location.reload()}>Reîncarcă</Button>
      </Card>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn('relative bg-black rounded-lg overflow-hidden w-full aspect-video select-none', className)}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Водяной знак с информацией о пользователе */}
      {userEmail && (
        <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full pointer-events-none font-mono">
          {userEmail}
        </div>
      )}
      
      {/* Основное видео */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        style={{
          pointerEvents: 'none' // Дополнительная защита
        }}
      />
      
      {/* Невидимый canvas для дополнительной защиты */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-0"
        width="1"
        height="1"
      />
      
      {/* Защитный overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      />
      
      {/* Indicator de încărcare */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Se încarcă video-ul...</p>
          </div>
        </div>
      )}
      
      {/* Controale personalizate */}
      {controls && !state.isLoading && state.showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 md:p-4 z-10 transition-opacity duration-300">
          {/* Bara de progres */}
            <div 
              className="w-full bg-white/20 rounded-full h-1 md:h-1.5 mb-2 cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="bg-red-500 h-1 md:h-1.5 rounded-full transition-all"
                style={{ width: `${(state.currentTime / state.duration) * 100 || 0}%` }}
              />
            </div>
          
          {/* Controale principale */}
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
            
            {/* Timp */}
            <div className="text-white text-xs md:text-sm font-mono">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </div>
            
            <div className="flex-1" />
            
            {/* Derulare */}
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
            
            {/* Setări calitate */}
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleSettings}
                className="text-white hover:bg-white/20 p-1 md:p-2"
              >
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              
              {/* Meniu setări */}
              {state.showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[120px]">
                  <div className="text-white text-xs font-semibold mb-2 px-2">Calitate</div>
                  {state.availableQualities.map((quality) => (
                    <button
                      key={quality}
                      onClick={() => changeQuality(quality)}
                      className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-white/20 transition-colors ${
                        state.selectedQuality === quality ? 'text-red-500 font-semibold' : 'text-white'
                      }`}
                    >
                      {quality}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
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
      
      {/* Informații despre video */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
        <h3 className="text-white text-lg font-semibold mb-1">{title}</h3>
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <span>Calitate: {state.selectedQuality}</span>
          {userEmail && (
            <>
              <span>•</span>
              <span className="font-mono text-xs">{userEmail}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SecureVideoPlayer