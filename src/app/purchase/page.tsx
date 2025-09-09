'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserStatus } from '@/components/auth/user-status'
import { PaymentForm } from '@/components/payment/payment-form'
import { Calendar, Clock, MapPin, Users, Star, Ticket, Play, ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

// Datele evenimentului
const upcomingEvent = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Seară de Stand-up',
  subtitle: 'Cei mai buni comedianți din Moldova',
  description: 'Alăturați-vă unei seri de neuitat plină de râs! Cei mai buni comedianți de stand-up din Moldova vor prezenta numere noi.',
  date: '2025-09-21',
  time: '20:00',
  duration: '2 ore',
  venue: 'Transmisiune online',
  price: 300,
  currency: 'MDL',
  poster: '/event_poster.jpg',
  features: [
    'Calitate video HD',
    'Chat interactiv',
    'Înregistrarea disponibilă 7 zile',
    'Suport pentru toate dispozitivele'
  ],
  performers: [
    'Alexandru Ivanov',
    'Maria Petrova', 
    'Dmitri Sidorov'
  ]
}

export default function PurchasePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [streamData, setStreamData] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchStreamData()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStreamData = async () => {
    try {
      const { data, error } = await supabase
        .from('stream_settings')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (data) {
        setStreamData(data)
      }
    } catch (error) {
      console.error('Error fetching stream data:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Se încarcă...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">S</span>
              </div>
              <span className="text-white font-bold text-xl">StandUp MD</span>
            </Link>
            <UserStatus />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Acasă</Link>
              <ArrowRight className="w-4 h-4" />
              <span className="text-white">Cumpărare bilet</span>
            </div>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Event Details */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={upcomingEvent.poster}
                          alt={upcomingEvent.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl text-white mb-2">
                          {upcomingEvent.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg mb-3">
                          {upcomingEvent.subtitle}
                        </CardDescription>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(upcomingEvent.date).toLocaleDateString('ru-RU')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{upcomingEvent.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-6">{upcomingEvent.description}</p>
                    
                    {/* Event Features */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Ce este inclus:</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {upcomingEvent.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performers */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Participanți:</h3>
                      <div className="flex flex-wrap gap-2">
                        {upcomingEvent.performers.map((performer, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-200 border-purple-500/30">
                            {performer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span>Securitate și confort</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-white font-medium">Autorizare rapidă</p>
                          <p className="text-gray-400 text-sm">Conectați-vă prin Google sau Apple în câteva secunde</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Plăți securizate</p>
                          <p className="text-gray-400 text-sm">Toate tranzacțiile sunt protejate prin criptare bancară</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Acces instantaneu</p>
                          <p className="text-gray-400 text-sm">Primiți linkul pentru transmisiune imediat după plată</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Purchase Form */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Cumpărare bilet</CardTitle>
                    <CardDescription className="text-gray-300">
                      Doar un pas până la vizionarea transmisiunii
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Price Display */}
                    <div className="bg-gradient-to-r from-purple-600/20 to-yellow-400/20 rounded-lg p-6 mb-6 border border-purple-500/30">
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-2">Prețul biletului</p>
                        <p className="text-4xl font-bold text-white mb-2">
                          {upcomingEvent.price} <span className="text-2xl text-gray-300">{upcomingEvent.currency}</span>
                        </p>
                        <p className="text-yellow-400 text-sm">Include acces la înregistrare pentru 7 zile</p>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-white/10" />

                    {/* Payment Form */}
                    {user ? (
                      <div className="space-y-4">
                        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <p className="text-green-200 text-sm">Sunteți autorizat ca {user.email}</p>
                          </div>
                        </div>
                        <PaymentForm 
                          streamId={streamData?.id || upcomingEvent.id}
                          streamTitle={upcomingEvent.title}
                          price={upcomingEvent.price}
                          currency={upcomingEvent.currency}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
                          <p className="text-yellow-200 text-sm mb-3">
                            Pentru a cumpăra biletul este necesar să vă conectați în sistem
                          </p>
                        </div>
                        <Link href="/auth/login">
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold py-3 text-lg">
                            Conectează-te și cumpără bilet
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </Link>
                        <p className="text-center text-gray-400 text-sm">
                          Conectare rapidă prin Google sau Apple
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Informații importante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-300">
                      <p>• Linkul pentru transmisiune va fi trimis pe email-ul dumneavoastră imediat după plată</p>
                      <p>• Transmisiunea va începe la {upcomingEvent.time} ora Moldovei</p>
                      <p>• Înregistrarea va fi disponibilă timp de 7 zile după eveniment</p>
                      <p>• În caz de probleme tehnice, contactați suportul</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}