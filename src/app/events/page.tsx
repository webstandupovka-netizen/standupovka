'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/hooks/useUser'
import { Calendar, Clock, MapPin, Users, Star, Ticket, ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'

// Данные мероприятий
const events = [
  {
    id: 'standup-sept-21',
    title: 'Стендап Вечер',
    subtitle: 'Лучшие комики Молдовы',
    description: 'Присоединяйтесь к незабываемому вечеру смеха! Лучшие стендап-комики Молдовы выступят с новыми номерами.',
    date: '2024-09-21',
    time: '20:00',
    duration: '2 часа',
    venue: 'Онлайн трансляция',
    price: 300,
    currency: 'MDL',
    poster: '/event_poster.jpg',
    status: 'upcoming',
    performers: [
      'Александр Иванов',
      'Мария Петрова', 
      'Дмитрий Сидоров'
    ],
    tags: ['Стендап', 'Комедия', 'Онлайн']
  }
]

export default function EventsPage() {
  const [hasAccess, setHasAccess] = useState(false)
  const { user } = useUser()
  const supabase = createClient()

  const checkUserAccess = useCallback(async () => {
    if (!user) return
    
    try {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single()

      setHasAccess(!!payment)
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      checkUserAccess()
    }
  }, [user, checkUserAccess])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">StandUp MD</h1>
                <p className="text-sm text-gray-300">Комедия в Молдове</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Главная
                </Button>
              </Link>
              <Link href="/comedians">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Комики
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  О нас
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Мероприятия
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Откройте для себя лучшие стендап-шоу и комедийные вечера
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 overflow-hidden hover:border-yellow-500/30 transition-all duration-300">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Poster */}
                  <div className="lg:col-span-1">
                    <div className="relative group h-full min-h-[400px]">
                      <Image
                        src={event.poster}
                        alt={event.title}
                        fill
                        className="object-cover rounded-l-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Скоро
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-2 p-6">
                    <CardHeader className="p-0 mb-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-gray-300 border-gray-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <CardTitle className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="text-xl text-yellow-400 mb-4">
                        {event.subtitle}
                      </CardDescription>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {event.description}
                      </p>
                    </CardHeader>

                    <CardContent className="p-0">
                      {/* Event Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Calendar className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Дата</p>
                            <p className="font-semibold">21 Сент</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-300">
                          <Clock className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Время</p>
                            <p className="font-semibold">{event.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-300">
                          <MapPin className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Формат</p>
                            <p className="font-semibold">{event.venue}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-300">
                          <Ticket className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Цена</p>
                            <p className="font-semibold text-yellow-400">
                              {event.price} {event.currency}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Performers */}
                      <div className="mb-8">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-yellow-400" />
                          Участники:
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {event.performers.map((performer, performerIndex) => (
                            <div key={performerIndex} className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                              <span className="text-gray-300 font-medium">{performer}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        {user && hasAccess ? (
                          <Link href="/stream" className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200">
                              <Play className="w-5 h-5 mr-2" />
                              Смотреть
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/buy?streamId=${event.id}`} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-6 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200">
                              <Ticket className="w-5 h-5 mr-2" />
                              Купить билет
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </Link>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="border-2 border-white/20 text-white hover:bg-white/10 py-6 px-8 text-lg rounded-xl backdrop-blur-sm"
                        >
                          Подробнее
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border-gray-700/30 p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-white mb-4">
                Больше мероприятий скоро!
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Следите за обновлениями, чтобы не пропустить новые шоу
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 px-8 py-3 rounded-xl"
              >
                Уведомить о новых событиях
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}