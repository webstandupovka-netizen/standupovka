'use client'

import { useEffect, useState } from 'react'

interface YouTubePlayerProps {
  videoUrl: string
  title?: string
  userEmail?: string
  className?: string
}

// Функция для извлечения YouTube video ID из URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

export default function YouTubePlayer({ 
  videoUrl, 
  title = 'Запись стрима', 
  userEmail,
  className = '' 
}: YouTubePlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = extractYouTubeVideoId(videoUrl)
    if (id) {
      setVideoId(id)
      setError(null)
    } else {
      setError('Неверный формат YouTube URL')
    }
    setIsLoading(false)
  }, [videoUrl])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Загрузка видео...</p>
        </div>
      </div>
    )
  }

  if (error || !videoId) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}>
        <div className="text-white text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-lg">{error || 'Ошибка загрузки видео'}</p>
        </div>
      </div>
    )
  }

  // Параметры для YouTube embed с дополнительной защитой
  const embedParams = new URLSearchParams({
    autoplay: '0',
    controls: '1',
    disablekb: '1',        // Отключить клавиатурные сокращения
    fs: '1',               // Разрешить полноэкранный режим
    modestbranding: '1',   // Минимальный брендинг YouTube
    rel: '0',              // Не показывать похожие видео
    showinfo: '0',         // Не показывать информацию о видео
    iv_load_policy: '3',   // Не показывать аннотации
    cc_load_policy: '0',   // Не показывать субтитры по умолчанию
    playsinline: '1',      // Воспроизведение в плеере (iOS)
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  })

  const embedUrl = `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}`

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Водяной знак с информацией о пользователе */}
      {userEmail && (
        <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded pointer-events-none">
          {userEmail}
        </div>
      )}
      
      {/* YouTube iframe */}
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        style={{
          minHeight: '400px',
          aspectRatio: '16/9'
        }}
      />
      
      {/* Overlay для дополнительной защиты */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Невидимый overlay, который можно использовать для дополнительной защиты */}
      </div>
      
      {/* Информация о видео */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <p className="text-gray-300 text-sm">Запись стрима</p>
      </div>
    </div>
  )
}