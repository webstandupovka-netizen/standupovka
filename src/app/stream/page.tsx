'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { VideoPlayer } from '@/components/video/video-player'
import { StreamCountdown } from '@/components/stream/stream-countdown'
import { CloseStreamButton } from '@/components/stream/close-stream-button'
import { UserStatus } from '@/components/auth/user-status'
import { StreamSessionManager } from '@/components/stream/stream-session-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Play, Users, Calendar, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface StreamData {
  id: string
  title: string
  description: string
  castr_stream_id?: string
  castr_embed_url?: string
  castr_rtmp_url?: string
  castr_stream_key?: string
  castr_playback_url?: string
  stream_start_time: string
  stream_end_time?: string
  poster_url?: string
  is_live: boolean
  is_active: boolean
}

interface PaymentData {
  id: string
  status: string
  metadata: {
    stream_id: string
    stream_title: string
  }
}

export default function StreamPage() {
  const [stream, setStream] = useState<StreamData | null>(null)
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [canStream, setCanStream] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAccessAndLoadStream = async () => {
      try {
        // Проверяем аутентификацию
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // Сохраняем полный URL с параметрами при редиректе на логин
          const currentUrl = window.location.pathname + window.location.search
          router.push('/auth/login?redirect=' + encodeURIComponent(currentUrl))
          return
        }

        // Проверяем профиль пользователя на бесплатный доступ
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('free_access')
          .eq('id', session.user.id)
          .single()

        let streamId: string | null = null
        let hasAccess = false

        // Если у пользователя есть бесплатный доступ
        if (userProfile?.free_access) {
          hasAccess = true
          // Получаем ID стрима из URL или используем дефолтный
          const urlParams = new URLSearchParams(window.location.search)
          streamId = urlParams.get('stream_id') || '550e8400-e29b-41d4-a716-446655440000'
        } else {
          // Проверяем оплату для пользователей без бесплатного доступа
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'completed')
            .single()

          if (paymentError || !paymentData) {
            router.push('/?error=payment_required')
            return
          }

          setPayment(paymentData)
          streamId = paymentData.metadata?.stream_id
          hasAccess = true
        }

        if (!streamId) {
          setError('ID стрима не найден')
          setIsLoading(false)
          return
        }

        const response = await fetch(`/api/stream/${streamId}`)
        
        if (!response.ok) {
          setError('Стрим не найден или неактивен')
          setIsLoading(false)
          return
        }
        
        const streamData = await response.json()
        setStream(streamData)
        setCanStream(true) // Разрешаем просмотр стрима после успешной загрузки

      } catch (error) {
        console.error('Error loading stream:', error)
        setError('Eroare la încărcarea streamului')
      } finally {
        setIsLoading(false)
      }
    }

    checkAccessAndLoadStream()
  }, [router, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#10C23F]/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-[#10C23F] relative z-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#F2F2F2] mb-2">Se încarcă transmisia</h2>
          <p className="text-[#CCCCCC] text-base md:text-lg">Vă rugăm să așteptați...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="bg-[#111111] border border-[#D61515]/50 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-[#D61515]/20">
                <div className="h-8 w-8 bg-[#D61515] rounded-full mx-auto" />
              </div>
              <CardTitle className="text-[#D61515] text-xl md:text-2xl font-bold">Eroare de încărcare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-[#D61515]/10 border border-[#D61515]/30">
                <AlertDescription className="text-[#F2F2F2] text-center text-sm md:text-lg">{error}</AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1 border-[#333333] text-[#F2F2F2] hover:bg-[#333333] hover:border-[#10C23F] transition-all duration-200">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Pagina principală
                  </Link>
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1 bg-[#D61515] hover:bg-[#B91212] text-white transition-all duration-200"
                >
                  Încearcă din nou
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="bg-[#111111] border border-[#333333] shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 rounded-full bg-[#666666]/20">
                <div className="h-8 w-8 bg-[#666666] rounded-full mx-auto" />
              </div>
              <CardTitle className="text-[#F2F2F2] text-xl md:text-2xl font-bold">Transmisia nu a fost găsită</CardTitle>
              <CardDescription className="text-[#CCCCCC] text-base md:text-lg mt-2">
                Nu am putut găsi transmisia solicitată
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#10C23F] hover:bg-[#0EA235] text-white transition-all duration-200">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Înapoi la pagina principală
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[#333333]"
      >
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <Button asChild variant="ghost" className="text-[#F2F2F2] hover:text-[#10C23F] hover:bg-[#10C23F]/10 transition-all duration-200 text-sm md:text-base px-2 md:px-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Înapoi la principală</span>
                <span className="sm:hidden">Înapoi</span>
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium ${
                stream.is_live 
                  ? 'bg-[#D61515]/20 text-[#D61515] border border-[#D61515]/30' 
                  : 'bg-[#666666]/20 text-[#666666] border border-[#666666]/30'
              }`}>
                <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${
                  stream.is_live ? 'bg-[#D61515] animate-pulse' : 'bg-[#666666]'
                }`} />
                {stream.is_live ? 'LIVE' : 'OFFLINE'}
              </div>
              
              <CloseStreamButton 
                streamId={stream.id}
                variant="outline"
                size="sm"
                className="border-[#333333] hover:border-[#D61515] hover:text-[#D61515] transition-all duration-200 text-xs md:text-sm px-2 md:px-3"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12 text-center px-2"
        >
          <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#F2F2F2] mb-4 md:mb-6 leading-tight">
            {stream.title}
          </h1>
          <p className="text-[#CCCCCC] text-base md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed">
            {stream.description}
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >

        </motion.div>

        {/* Main Content - Full Width Video */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Video Container */}
            <div className="relative bg-black rounded-xl md:rounded-2xl overflow-hidden border border-[#333333] shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-black via-[#111111] to-black">
                {canStream ? (
                  stream.castr_playback_url ? (
                    stream.castr_playback_url.includes('player.castr.com') ? (
                      <iframe
                        src={stream.castr_playback_url}
                        className="w-full h-full rounded-2xl"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={stream.title}
                      />
                    ) : (
                      <VideoPlayer
                        type="hls"
                        src={stream.castr_playback_url}
                        poster={stream.poster_url}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="w-full h-full rounded-2xl"
                      />
                    )
                  ) : stream.castr_embed_url ? (
                    <iframe
                      src={stream.castr_embed_url}
                      className="w-full h-full rounded-2xl"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={stream.title}
                    />
                  ) : (
                    <StreamCountdown 
                      streamStartTime={stream.stream_start_time}
                      streamTitle={stream.title}
                      className="w-full h-full rounded-2xl"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#111111] to-black">
                    <div className="text-center text-[#F2F2F2] p-4 md:p-8 max-w-md mx-auto">
                      <div className="relative mb-4 md:mb-6">
                        <div className="absolute inset-0 bg-[#10C23F]/20 rounded-full blur-xl" />
                        <Play className="h-12 w-12 md:h-20 md:w-20 mx-auto text-[#10C23F] relative z-10" />
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold mb-2 leading-tight">Pregătire pentru transmisie</h3>
                      <p className="text-[#CCCCCC] text-sm md:text-lg leading-relaxed">Verificați statusul sesiunii de mai sus pentru a începe vizionarea</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Overlay Info */}
              {canStream && (
                <div className="absolute top-3 md:top-4 left-3 md:left-4 flex items-center gap-2 md:gap-3 flex-wrap">
                  <div className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium backdrop-blur-md ${
                    stream.is_live 
                      ? 'bg-[#D61515]/90 text-white' 
                      : 'bg-black/70 text-[#CCCCCC]'
                  }`}>
                    <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${
                      stream.is_live ? 'bg-white animate-pulse' : 'bg-[#666666]'
                    }`} />
                    {stream.is_live ? 'LIVE' : 'OFFLINE'}
                  </div>
                  
                  {isPlaying && (
                    <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-[#10C23F]/90 text-white backdrop-blur-md">
                      <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-white rounded-full animate-pulse" />
                      <span className="hidden sm:inline">În redare</span>
                      <span className="sm:hidden">Play</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}