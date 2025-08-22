'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Play } from 'lucide-react'

interface StreamCountdownProps {
  streamStartTime: string
  streamTitle?: string
  className?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function StreamCountdown({ 
  streamStartTime, 
  streamTitle = 'Трансляция',
  className = '' 
}: StreamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [hasStarted, setHasStarted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const calculateTimeLeft = () => {
      const startTime = new Date(streamStartTime).getTime()
      const now = new Date().getTime()
      const difference = startTime - now

      if (difference <= 0) {
        setHasStarted(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [streamStartTime, mounted])

  const formatStartTime = () => {
    if (!mounted) return ''
    
    const startTime = new Date(streamStartTime)
    return startTime.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeOnly = () => {
    if (!mounted) return ''
    
    const startTime = new Date(streamStartTime)
    return startTime.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4 ${className}`}>
        <div className="text-center text-white">
          <div className="animate-pulse">
            <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
            <p className="text-xl font-semibold mb-2">Se încarcă...</p>
          </div>
        </div>
      </div>
    )
  }

  if (hasStarted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-green-900/20 to-green-800/20 px-4 ${className}`}>
        <motion.div 
          className="text-center text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Play className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 md:mb-6 text-green-400" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-green-400">
            🎉 Трансляция началась!
          </h2>
          <p className="text-base md:text-lg text-gray-300 mb-2">
            {streamTitle}
          </p>
          <p className="text-xs md:text-sm text-gray-400">
            Обновите страницу, если видео не загрузилось
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-black px-4 ${className}`}>
      <motion.div 
        className="text-center text-white max-w-md mx-auto p-4 md:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Clock className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6 text-yellow-400" />
        </motion.div>
        
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
          {streamTitle}
        </h2>
        
        <p className="text-sm md:text-lg mb-4 md:mb-6 text-gray-300">
          Трансляция начнется в <span className="text-yellow-400 font-semibold">{formatTimeOnly()}</span>
        </p>
        
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-gray-700/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-lg md:text-2xl font-bold text-yellow-400">
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              {timeLeft.days === 1 ? 'День' : 'Дней'}
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-gray-700/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-lg md:text-2xl font-bold text-yellow-400">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              {timeLeft.hours === 1 ? 'Час' : 'Часов'}
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-gray-700/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-lg md:text-2xl font-bold text-yellow-400">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Минут
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-gray-700/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="text-lg md:text-2xl font-bold text-yellow-400"
              animate={{ 
                scale: timeLeft.seconds % 2 === 0 ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {timeLeft.seconds.toString().padStart(2, '0')}
            </motion.div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">
              Секунд
            </div>
          </motion.div>
        </div>
        
        <div className="text-xs md:text-sm text-gray-400 space-y-1">
          <p>Полная дата начала:</p>
          <p className="font-mono text-gray-300 text-xs md:text-sm">{formatStartTime()}</p>
        </div>
        
        <motion.div 
          className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs md:text-sm text-blue-300">
            💡 Страница автоматически обновится после начала трансляции
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}