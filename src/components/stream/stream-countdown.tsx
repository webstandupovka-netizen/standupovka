'use client'

import { useState, useEffect } from 'react'

interface StreamCountdownProps {
  streamStartTime: string
  streamTitle?: string
  className?: string
}

export function StreamCountdown({
  streamStartTime,
  streamTitle = 'Transmisiune',
  className = ''
}: StreamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [hasStarted, setHasStarted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const calc = () => {
      const diff = new Date(streamStartTime).getTime() - Date.now()
      if (diff <= 0) {
        setHasStarted(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      })
    }

    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [streamStartTime, mounted])

  if (!mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-black ${className}`}>
        <div className="animate-pulse text-white/30 text-sm">Se încarcă...</div>
      </div>
    )
  }

  if (hasStarted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-black ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <p className="text-white font-semibold text-lg mb-1">{streamTitle}</p>
          <p className="text-white/40 text-sm">Transmisiunea ar trebui să înceapă curând...</p>
        </div>
      </div>
    )
  }

  const startDate = new Date(streamStartTime)
  const dateStr = startDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })
  const timeStr = startDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`w-full h-full flex items-center justify-center bg-black ${className}`}>
      <div className="text-center px-4">
        <p className="text-white font-bold text-xl md:text-2xl mb-2">{streamTitle}</p>
        <p className="text-white/40 text-sm mb-8">
          {dateStr} • {timeStr}
        </p>

        {/* Countdown */}
        <div className="inline-flex items-center gap-3 md:gap-5 mb-8">
          {[
            { value: timeLeft.days, label: 'zile' },
            { value: timeLeft.hours, label: 'ore' },
            { value: timeLeft.minutes, label: 'min' },
            { value: timeLeft.seconds, label: 'sec' }
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-3 md:gap-5">
              {i > 0 && <span className="text-white/10 text-2xl font-light">:</span>}
              <div className="text-center">
                <span className="text-white font-bold text-3xl md:text-5xl tabular-nums block leading-none">
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-white/30 text-[10px] uppercase tracking-widest mt-1 block">{label}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/20 text-xs">
          Pagina se va actualiza automat la începutul transmisiunii
        </p>
      </div>
    </div>
  )
}
