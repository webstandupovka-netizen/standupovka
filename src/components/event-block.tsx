'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { UserProfile } from '@/types/database'

interface EventBlockProps {
  user: UserProfile | null
  hasAccess: boolean
  isLoading?: boolean
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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', padding: '10px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '4px' }}>Începe în</span>
      {[
        { value: timeLeft.days, label: 'z' },
        { value: timeLeft.hours, label: 'h' },
        { value: timeLeft.minutes, label: 'm' },
        { value: timeLeft.seconds, label: 's' }
      ].map(({ value, label }, i) => (
        <span key={label} style={{ display: 'flex', alignItems: 'baseline' }}>
          {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px' }}>:</span>}
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '20px', fontVariantNumeric: 'tabular-nums' }}>{String(value).padStart(2, '0')}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginLeft: '2px' }}>{label}</span>
        </span>
      ))}
    </div>
  )
}

export function EventBlock({ user, hasAccess, streamData, isLoading }: EventBlockProps) {
  if (!streamData) {
    if (isLoading) {
      // Skeleton — пользователь видит что страница загружается
      return (
        <div style={{ minHeight: '85vh', background: '#000', display: 'flex', alignItems: 'flex-end', padding: '56px 16px' }}>
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
            <div style={{ width: '200px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '20px' }} />
            <div style={{ width: '80%', maxWidth: '500px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }} />
            <div style={{ width: '60%', maxWidth: '400px', height: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '32px' }} />
            <div style={{ width: '220px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px' }} />
          </div>
        </div>
      )
    }
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>Nu există evenimente active</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginTop: '8px' }}>Reveniți mai târziu</p>
        </div>
      </div>
    )
  }

  const date = new Date(streamData.stream_start_time)
  const day = date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })
  const time = date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
  const weekday = date.toLocaleDateString('ro-RO', { weekday: 'long' })
  const posterSrc = streamData.poster_url || '/event_poster.jpg'

  let ctaHref = '/auth/login'
  let ctaText = 'Conectează-te pentru a viziona'
  let ctaBg = '#fff'
  let ctaColor = '#000'

  if (hasAccess || user?.free_access) {
    ctaHref = `/stream?stream_id=${streamData.id}`
    ctaText = hasAccess ? 'Vizionează acum' : 'Vizionează gratuit'
  } else if (user) {
    ctaHref = `/buy?streamId=${streamData.id}`
    ctaText = `Cumpără bilet — ${streamData.price} ${streamData.currency}`
    ctaBg = '#dc2626'
    ctaColor = '#fff'
  }

  return (
    <div style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
      {/* Background */}
      <img
        src={posterSrc}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000, rgba(0,0,0,0.6), rgba(0,0,0,0.2))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)', pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '128px 16px 56px' }}>
        {/* Date */}
        <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
          {day} • {time} <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 8px' }}>|</span> <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{weekday}</span>
        </p>

        {/* Title */}
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(28px, 6vw, 60px)', lineHeight: 1, textTransform: 'uppercase', maxWidth: '700px', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {streamData.title}
        </h1>

        {/* Description */}
        {streamData.description && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6, maxWidth: '500px', marginBottom: '32px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {streamData.description}
          </p>
        )}

        {/* Countdown */}
        <div style={{ marginBottom: '32px' }}>
          <CountdownTimer targetDate={streamData.stream_start_time} />
        </div>

        {/* CTA — простая ссылка, работает без JS */}
        <a
          href={ctaHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: ctaBg,
            color: ctaColor,
            fontWeight: 700,
            fontSize: '15px',
            padding: '14px 28px',
            borderRadius: '999px',
            textDecoration: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
          }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          {ctaText}
        </a>
      </div>
    </div>
  )
}
