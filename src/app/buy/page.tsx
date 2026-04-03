'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, Play, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
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
  poster_square_url?: string
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
    
    // Verificăm autorizarea utilizatorului
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Dacă utilizatorul nu este autorizat, îl redirecționăm la pagina de conectare
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
        throw new Error(data.error || 'Eroare la crearea plății')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Eroare la crearea plății')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchStreamData = async () => {
      if (!streamId) {
        setError('ID-ul transmisiunii nu este specificat')
        setIsLoading(false)
        return
      }

      try {
        // Obținem datele transmisiunii prin API
        const response = await fetch(`/api/stream/${streamId}`)
        
        if (!response.ok) {
          setError('Transmisiunea nu a fost găsită sau nu este activă')
          setIsLoading(false)
          return
        }
        
        const streamData = await response.json()
        setStream(streamData)

        // Verificăm dacă utilizatorul are acces
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session && streamId) {
          const { data: payment } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'completed')
            .contains('metadata', { stream_id: streamId })
            .single()

          if (payment) {
            setHasAccess(true)
          }
        }

      } catch (error) {
        console.error('Error fetching stream data:', error)
        setError('Eroare la încărcarea datelor transmisiunii')
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
              <Star className="w-5 h-5 text-red-400" />
              Eroare
            </CardTitle>
            <CardDescription className="text-gray-300">
              {error || 'Transmisiunea nu a fost găsită'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Încearcă din nou
              </Button>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-white/10">
                  Acasă
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
                Aveți acces!
              </CardTitle>
              <CardDescription className="text-gray-300">
                Ați plătit deja accesul la transmisiune
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/stream/${stream.id}`}>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Urmărește transmisiunea
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const eventDate = new Date(stream.stream_start_time)
  const dateStr = eventDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = eventDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-8 md:py-16 pt-24">
      <div className="w-full max-w-[900px] mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-0 bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
        >
          {/* Left — Square poster + event info */}
          <div className="relative md:w-[340px] flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stream.poster_square_url || stream.poster_url || '/event_poster.jpg'}
              alt={stream.title}
              className="w-full aspect-square md:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <h1 className="text-white font-bold text-lg md:text-xl leading-tight mb-1">{stream.title}</h1>
              <p className="text-white/60 text-xs">{dateStr} • {timeStr}</p>
            </div>
          </div>

          {/* Right — Payment card */}
          <div className="flex-1 p-6 md:p-8">
            <h2 className="text-gray-900 font-bold text-xl mb-6">Achiziționează accesul</h2>

            {/* What's included */}
            <div className="space-y-3 mb-6">
              {[
                'Vizionare live în calitate HD',
                'Acces la înregistrare după eveniment',
                'Un dispozitiv simultan'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Total</span>
                <span className="text-gray-900 font-bold text-2xl">{stream.price} {stream.currency}</span>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 mb-5">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-gray-900 rounded cursor-pointer"
              />
              <label htmlFor="terms-agreement" className="text-gray-400 text-xs leading-relaxed cursor-pointer">
                Sunt de acord cu{' '}
                <Link href="/terms" className="text-gray-600 underline hover:text-gray-900">termenii</Link>
                {' '}și{' '}
                <Link href="/privacy" className="text-gray-600 underline hover:text-gray-900">politica de confidențialitate</Link>
              </label>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={isLoading || !agreedToTerms}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Plătește {stream.price} {stream.currency}
                </>
              )}
            </button>

            {/* Payment method */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-gray-300 text-[10px]">Plata securizată prin</span>
              <Image src="/maib-logo.svg" alt="MAIB" width={60} height={12} className="h-3 w-auto opacity-40" />
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