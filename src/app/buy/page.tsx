'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, Play, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'
import Image from 'next/image'

interface StreamData {
  id: string
  title: string
  description: string
  price: number
  currency: string
  stream_start_time: string
  stream_end_time?: string
  poster_url?: string
  is_live: boolean
  is_active: boolean
}

function BuyPageInner() {
  const searchParams = useSearchParams()
  const [stream, setStream] = useState<StreamData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const supabase = createClient()
  const streamId = searchParams.get('streamId')

  const handlePayment = async () => {
    if (!stream) return
    
    // Проверяем авторизацию пользователя
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      window.location.href = '/auth/login'
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId: stream.id,
          returnUrl: `${window.location.origin}/payment/success`,
          failUrl: `${window.location.origin}/buy?streamId=${stream.id}&error=payment_failed`
        }),
      })

      const data = await response.json()

      if (response.ok && (data.payUrl || data.paymentUrl)) {
        window.location.href = data.payUrl || data.paymentUrl
      } else {
        throw new Error(data.error || 'Ошибка создания платежа')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Ошибка создания платежа')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchStreamData = async () => {
      if (!streamId) {
        setError('ID стрима не указан')
        setIsLoading(false)
        return
      }

      try {
        // Получаем данные стрима через API
        const response = await fetch(`/api/stream/${streamId}`)
        
        if (!response.ok) {
          setError('Стрим не найден или неактивен')
          setIsLoading(false)
          return
        }
        
        const streamData = await response.json()
        setStream(streamData)

        // Проверяем, есть ли у пользователя доступ
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const { data: payment } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'completed')
            .single()

          if (payment) {
            setHasAccess(true)
          }
        }

      } catch (error) {
        console.error('Error fetching stream data:', error)
        setError('Ошибка загрузки данных стрима')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreamData()
  }, [streamId, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Se încarcă...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Obținem informații despre transmisie...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !stream) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-red-400" />
              Ошибка
            </CardTitle>
            <CardDescription className="text-gray-300">
              {error || 'Стрим не найден'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-white/10">
                  На главную
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasAccess) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700/30">
            <CardHeader className="text-center">
              <Star className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-400">
                У вас есть доступ!
              </CardTitle>
              <CardDescription className="text-gray-300">
                Вы уже оплатили доступ к стриму
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/stream/${stream.id}`}>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Смотреть стрим
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)] py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Левая часть - Информация о событии */}
          <div className="flex-1 space-y-8">
            {/* Основная информация о событии */}
            <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="space-y-4">
                <h1 className="text-white font-black text-2xl md:text-4xl lg:text-5xl leading-tight uppercase">
                  {stream.title}
                </h1>
                <div className="max-w-lg">
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                    {stream.description}
                  </p>
                </div>
              </div>

              {/* Постер события */}
              {stream.poster_url && (
                <div className="w-full max-w-[600px] h-[250px] md:h-[400px]">
                  <img 
                    src={stream.poster_url} 
                    alt={stream.title}
                    className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                  />
                </div>
              )}

              {/* Информация о дате и статусе */}
              <div className="space-y-4">
                {/* Дата и время */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <img src="/calendar.svg" alt="Calendar" className="w-6 h-6" />
                    <span className="text-gray-200 font-bold text-sm">Începutul</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-200 font-bold text-sm">
                      {new Date(stream.stream_start_time).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
                    </span>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <span className="text-gray-200 font-bold text-lg">
                      {new Date(stream.stream_start_time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Статус */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      stream.is_live ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-200 font-bold text-sm">status</span>
                  </div>
                  <span className="text-gray-200 font-bold text-sm">
                    {stream.is_live ? 'în direct' : 'nu în direct'}
                  </span>
                </div>
              </div>
            </div>

            {/* Что включено */}
            <div className="bg-gray-800/50 rounded-3xl p-4 md:p-6">
              <h3 className="text-gray-200 font-bold text-sm md:text-base mb-4">Ce este inclus</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-200 text-xs md:text-sm">Vizionare nelimitată în flux</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-200 text-xs md:text-sm">Calitate video HD</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-200 text-xs md:text-sm">Acces de pe orice dispozitiv</span>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть - Форма оплаты */}
          <div className="flex-1 max-w-md">
            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Заголовок */}
              <div className="space-y-4">
                <h2 className="text-white font-bold text-lg md:text-xl">Plata accesului</h2>
                <div className="flex gap-2">
                  <span className="text-gray-400 text-sm">Event:</span>
                  <span className="text-white text-sm">așa, bună seara!</span>
                </div>
              </div>

              {/* Информация о стоимости */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-3 md:p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-200 text-xs md:text-sm">Cost:</span>
                  <span className="text-gray-200 font-bold text-xs md:text-sm">300 MDL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200 text-xs md:text-sm">Acces:</span>
                  <span className="text-gray-200 text-xs md:text-sm">Vizionare nelimitată</span>
                </div>
              </div>

              {/* Уведомление */}
              <p className="text-gray-200 text-xs md:text-sm">
                Accesul se activează imediat după efectuarea plății
              </p>

              {/* Способы оплаты */}
               <div className="space-y-3 md:space-y-4">
                 <div className="space-y-2 md:space-y-3">
                   <p className="text-white text-xs md:text-sm font-normal">Pay Online:</p>
                   <div className="flex items-center gap-2 md:gap-3">
                     <Image 
                       src="/maib-logo.svg" 
                       alt="MAIB" 
                       width={110} 
                       height={16} 
                       className="h-3 md:h-4 w-auto"
                     />
                   </div>
                 </div>

                 {/* Чекбокс согласия с условиями */}
                 <div className="flex items-start gap-3">
                   <input
                     type="checkbox"
                     id="terms-agreement"
                     checked={agreedToTerms}
                     onChange={(e) => setAgreedToTerms(e.target.checked)}
                     className="mt-1 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:outline-none"
                   />
                   <label htmlFor="terms-agreement" className="text-gray-400 text-xs leading-relaxed cursor-pointer">
                     Sunt de acord cu{' '}
                     <Link href="/terms" className="text-red-400 hover:text-red-300 underline">
                       termenii și condițiile
                     </Link>
                     {' '}și{' '}
                     <Link href="/privacy" className="text-red-400 hover:text-red-300 underline">
                       politica de confidențialitate
                     </Link>
                   </label>
                 </div>
                 {/* Кнопка оплаты */}
                  <button 
                    onClick={handlePayment}
                    disabled={isLoading || !agreedToTerms}
                    className="bg-red-600 hover:bg-red-700 transition-colors rounded-xl px-4 md:px-6 py-2.5 md:py-3 cursor-pointer w-full disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <Image 
                            src="/pay.svg" 
                            alt="Pay" 
                            width={20} 
                            height={21} 
                            className="w-5 h-5"
                          />
                        </div>
                        <span className="text-white font-bold text-sm md:text-base uppercase">plătește</span>
                      </div>
                      <div className="bg-white rounded-xl px-3 py-1.5">
                        <span className="text-red-600 font-black text-base md:text-lg uppercase">300 mdl</span>
                      </div>
                    </div>
                  </button>
               </div>


            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function BuyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
          <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Se încarcă...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Pregătim pagina de cumpărare...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <BuyPageInner />
    </Suspense>
  )
}