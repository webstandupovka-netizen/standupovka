'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { UserProfile } from '@/types/database'

interface EventBlockProps {
  user: UserProfile | null
  hasAccess: boolean
  streamData: {
    id: string
    title: string
    description?: string
    price: number
    currency: string
    stream_start_time: string
    poster_url?: string
  } | null
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      }
    }
    setTimeLeft(calc())
    const timer = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) return null

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isExpired) return null

  return (
    <div className="inline-flex items-center gap-1.5 bg-white/[0.07] backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/[0.08]">
      <span className="text-white/40 text-xs uppercase tracking-wider mr-1">Începe în</span>
      {[
        { value: timeLeft.days, label: 'z' },
        { value: timeLeft.hours, label: 'h' },
        { value: timeLeft.minutes, label: 'm' },
        { value: timeLeft.seconds, label: 's' }
      ].map(({ value, label }, i) => (
        <span key={label} className="flex items-baseline">
          {i > 0 && <span className="text-white/20 mx-1">:</span>}
          <span className="text-white font-bold text-lg md:text-xl tabular-nums">{String(value).padStart(2, '0')}</span>
          <span className="text-white/30 text-[10px] ml-0.5">{label}</span>
        </span>
      ))}
    </div>
  )
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString)
  return {
    day: date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' }),
    time: date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
    weekday: date.toLocaleDateString('ro-RO', { weekday: 'long' })
  }
}

export function EventBlock({ user, hasAccess, streamData }: EventBlockProps) {
  if (!streamData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg">Nu există evenimente active</p>
          <p className="text-white/30 text-sm mt-2">Reveniți mai târziu</p>
        </div>
      </div>
    )
  }

  const { day, time, weekday } = formatEventDate(streamData.stream_start_time)
  const posterSrc = streamData.poster_url || '/event_poster.jpg'

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
      {/* Background poster — full bleed with Ken Burns effect */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover animate-ken-burns pointer-events-none"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6 pb-14 md:pb-24 pt-32 pointer-events-auto">
        {/* Meta line — date + tags */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-red-500 font-semibold text-sm tracking-wide uppercase">{day} • {time}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40 text-sm capitalize">{weekday}</span>
        </div>

        {/* Title — controlled, max 2 lines */}
        <h1 className="text-white font-black text-3xl md:text-5xl lg:text-6xl leading-[1] uppercase max-w-2xl mb-4 tracking-tight">
          {streamData.title}
        </h1>

        {/* Description — max 2 lines */}
        {streamData.description && (
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mb-8 line-clamp-2">
            {streamData.description}
          </p>
        )}

        {/* Countdown — inline compact */}
        <div className="mb-8">
          <CountdownTimer targetDate={streamData.stream_start_time} />
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-4 relative z-20">
          {hasAccess ? (
            <Link href={`/stream?stream_id=${streamData.id}`} className="group bg-white text-black font-bold text-sm md:text-base px-7 py-3.5 rounded-full inline-flex items-center gap-2.5 hover:bg-white/90 transition-all duration-200 active:scale-[0.97] cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Vizionează acum
            </Link>
          ) : user?.free_access ? (
            <Link href={`/stream?stream_id=${streamData.id}`} className="group bg-white text-black font-bold text-sm md:text-base px-7 py-3.5 rounded-full inline-flex items-center gap-2.5 hover:bg-white/90 transition-all duration-200 active:scale-[0.97] cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Vizionează gratuit
            </Link>
          ) : user && !user.free_access ? (
            <Link href={`/buy?streamId=${streamData.id}`} className="group bg-red-600 hover:bg-red-500 text-white font-bold text-sm md:text-base px-7 py-3.5 rounded-full inline-flex items-center gap-2.5 transition-all duration-200 active:scale-[0.97] cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Cumpără bilet — {streamData.price} {streamData.currency}
            </Link>
          ) : (
            <Link href="/auth/login" className="group bg-white text-black font-bold text-sm md:text-base px-7 py-3.5 rounded-full inline-flex items-center gap-2.5 hover:bg-white/90 transition-all duration-200 active:scale-[0.97] cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Conectează-te pentru a viziona
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
