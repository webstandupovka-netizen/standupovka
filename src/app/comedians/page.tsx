'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/hooks/useUser'
import { Star, Users, Calendar, MapPin, Instagram, Facebook, Youtube, Play, Ticket } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'

// Данные комиков
const comedians = [
  {
    id: 'aleksandr-ivanov',
    name: 'Александр Иванов',
    nickname: 'Саша Смех',
    bio: 'Резидент Comedy Club Moldova. Мастер наблюдательной комедии и импровизации.',
    experience: '5 лет',
    style: ['Наблюдательная комедия', 'Импровизация', 'Стендап'],
    achievements: [
      'Победитель Comedy Battle 2023',
      'Резидент Comedy Club Moldova',
      'Участник международных фестивалей'
    ],
    avatar: '/comedians/aleksandr.jpg',
    rating: 4.8,
    shows: 120,
    social: {
      instagram: '@sasha_smeh',
      facebook: 'sasha.smeh.comedy',
      youtube: '@SashaSmehComedy'
    }
  },
  {
    id: 'maria-petrova',
    name: 'Мария Петрова',
    nickname: 'Маша Угар',
    bio: 'Единственная женщина-комик в Молдове, которая заставит вас плакать от смеха.',
    experience: '3 года',
    style: ['Женский юмор', 'Семейные темы', 'Социальная сатира'],
    achievements: [
      'Лучший дебют года 2022',
      'Автор популярного YouTube канала',
      'Ведущая комедийных шоу'
    ],
    avatar: '/comedians/maria.jpg',
    rating: 4.9,
    shows: 85,
    social: {
      instagram: '@masha_ugar',
      facebook: 'masha.ugar.comedy',
      youtube: '@MashaUgarComedy'
    }
  },
  {
    id: 'dmitriy-sidorov',
    name: 'Дмитрий Сидоров',
    nickname: 'Дима Прикол',
    bio: 'Король абсурдного юмора и неожиданных поворотов. Его шутки запомнятся надолго.',
    experience: '7 лет',
    style: ['Абсурдный юмор', 'Черная комедия', 'Интерактив'],
    achievements: [
      'Ветеран молдавской сцены',
      'Организатор Stand-Up вечеров',
      'Наставник молодых комиков'
    ],
    avatar: '/comedians/dmitriy.jpg',
    rating: 4.7,
    shows: 200,
    social: {
      instagram: '@dima_prikol',
      facebook: 'dima.prikol.comedy',
      youtube: '@DimaPrikolComedy'
    }
  }
]

export default function ComediansPage() {
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
              <Link href="/events">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Мероприятия
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
            Наши Комики
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Познакомьтесь с талантливыми артистами, которые подарят вам незабываемые эмоции
          </p>
        </motion.div>

        {/* Comedians Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {comedians.map((comedian, index) => (
            <motion.div
              key={comedian.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 overflow-hidden hover:border-yellow-500/30 transition-all duration-300 h-full">
                {/* Avatar */}
                <div className="relative h-64 bg-gradient-to-br from-yellow-400/20 to-orange-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                      {comedian.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {comedian.rating}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-white">{comedian.name}</CardTitle>
                  <CardDescription className="text-yellow-400 font-medium">
                    "{comedian.nickname}"
                  </CardDescription>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {comedian.bio}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">{comedian.shows}</p>
                      <p className="text-xs text-gray-400">Выступлений</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">{comedian.experience}</p>
                      <p className="text-xs text-gray-400">Опыт</p>
                    </div>
                  </div>

                  {/* Style Tags */}
                  <div>
                    <p className="text-sm font-medium text-white mb-2">Стиль:</p>
                    <div className="flex flex-wrap gap-1">
                      {comedian.style.map((style, styleIndex) => (
                        <Badge key={styleIndex} variant="outline" className="text-xs text-gray-300 border-gray-600">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <p className="text-sm font-medium text-white mb-2">Достижения:</p>
                    <ul className="space-y-1">
                      {comedian.achievements.slice(0, 2).map((achievement, achIndex) => (
                        <li key={achIndex} className="flex items-center gap-2 text-xs text-gray-300">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3 pt-4 border-t border-gray-700/30">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 p-2">
                      <Instagram className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 p-2">
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 p-2">
                      <Youtube className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border-gray-700/30 p-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white mb-4">
                Хотите увидеть их в действии?
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Не пропустите выступление наших звезд 21 сентября!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user && hasAccess ? (
                  <Link href="/stream">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-3 rounded-xl">
                      <Play className="w-5 h-5 mr-2" />
                      Смотреть
                    </Button>
                  </Link>
                ) : (
                  <Link href="/buy?streamId=550e8400-e29b-41d4-a716-446655440000">
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3 rounded-xl">
                      <Ticket className="w-5 h-5 mr-2" />
                      Купить билет
                    </Button>
                  </Link>
                )}
                <Link href="/events">
                  <Button 
                    variant="outline" 
                    className="border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 px-8 py-3 rounded-xl"
                  >
                    Все мероприятия
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}