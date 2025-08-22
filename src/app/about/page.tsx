'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Users, Calendar, MapPin, Heart, Mic, Trophy, Target } from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    icon: Users,
    value: '500+',
    label: 'Довольных зрителей',
    description: 'Каждое шоу собирает полные залы'
  },
  {
    icon: Mic,
    value: '15+',
    label: 'Выступлений',
    description: 'Регулярные шоу каждый месяц'
  },
  {
    icon: Trophy,
    value: '3',
    label: 'Звездных комика',
    description: 'Лучшие артисты Молдовы'
  },
  {
    icon: Heart,
    value: '100%',
    label: 'Гарантия смеха',
    description: 'Или вернем деньги!'
  }
]

const values = [
  {
    icon: Target,
    title: 'Наша миссия',
    description: 'Развивать культуру стендап-комедии в Молдове и дарить людям радость через качественный юмор.'
  },
  {
    icon: Star,
    title: 'Наши ценности',
    description: 'Честность, креативность и уважение к зрителю. Мы создаем контент, который объединяет людей.'
  },
  {
    icon: Users,
    title: 'Наша команда',
    description: 'Профессиональные комики, продюсеры и техническая команда, работающие для вашего удовольствия.'
  }
]

export default function AboutPage() {
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
              <Link href="/comedians">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Комики
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            О нас
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Мы — первая профессиональная стендап-платформа в Молдове, объединяющая 
            талантливых комиков и любителей качественного юмора.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30">
            <CardHeader>
              <CardTitle className="text-3xl text-white text-center mb-4">
                Наша история
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    StandUp MD родился из желания привнести культуру стендап-комедии в Молдову. 
                    Мы начали с небольших выступлений в кафе и барах, а теперь организуем 
                    полноценные шоу с профессиональным звуком, светом и онлайн-трансляциями.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Наша цель — создать пространство, где молдавские комики могут развиваться, 
                    а зрители — получать качественные эмоции и заряд позитива.
                  </p>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Mic className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <p className="text-white font-bold text-lg">2021</p>
                      <p className="text-gray-300 text-sm">Год основания</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Наши достижения
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 text-center p-6 hover:border-yellow-500/30 transition-all duration-300">
                  <CardContent className="p-0">
                    <stat.icon className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                    <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                    <p className="text-yellow-400 font-medium mb-2">{stat.label}</p>
                    <p className="text-gray-300 text-sm">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Что нами движет
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-gray-700/30 h-full hover:border-yellow-500/30 transition-all duration-300">
                  <CardHeader className="text-center">
                    <value.icon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <CardTitle className="text-xl text-white">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed text-center">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border-gray-700/30 p-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white mb-4">
                Присоединяйтесь к нам!
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Станьте частью растущего комьюнити любителей качественной комедии в Молдове
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/buy?streamId=550e8400-e29b-41d4-a716-446655440000">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3 rounded-xl">
                    Купить билет на шоу
                  </Button>
                </Link>
                <Link href="/events">
                  <Button 
                    variant="outline" 
                    className="border-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 px-8 py-3 rounded-xl"
                  >
                    Смотреть расписание
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-700/30">
                <p className="text-gray-400 text-sm mb-4">Свяжитесь с нами:</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                  <a href="mailto:info@standupmd.com" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                    info@standupmd.com
                  </a>
                  <a href="tel:+37360123456" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                    +373 60 123 456
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}