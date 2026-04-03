'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { EventBlock } from '@/components/event-block'
import { StreamCard } from '@/components/stream-card'

const supabase = createClient()

export default function Home() {
  const [upcomingStream, setUpcomingStream] = useState<any>(null)
  const [archivedStreams, setArchivedStreams] = useState<any[]>([])
  const [hasAccessToUpcoming, setHasAccessToUpcoming] = useState(false)
  const [paidStreamIds, setPaidStreamIds] = useState<Set<string>>(new Set())

  const { user, profile, loading } = useUser()
  const userId = user?.id

  const fetchStreams = useCallback(async () => {
    try {
      // Загружаем через наш API (работает в любом браузере, нет CORS проблем)
      const res = await fetch('/api/streams')
      const { streams: allStreams } = await res.json()

      if (!allStreams || allStreams.length === 0) {
        setUpcomingStream(null)
        setArchivedStreams([])
        return
      }

      const now = new Date().toISOString()

      // Ищем: live > будущее > последнее
      const live = allStreams.find((s: any) => s.is_live)
      const upcoming = allStreams.find((s: any) => s.stream_start_time > now)
      const hero = live || upcoming || allStreams[0]

      setUpcomingStream(hero)

      // Архив — все кроме hero, прошедшие
      const archived = allStreams.filter((s: any) =>
        s.id !== hero.id && s.stream_start_time < now
      )
      setArchivedStreams(archived)
    } catch (error) {
      console.error('Error fetching streams:', error)
    }
  }, [])

  const checkAccess = useCallback(async () => {
    if (!userId || !profile) {
      setHasAccessToUpcoming(false)
      setPaidStreamIds(new Set())
      return
    }

    try {
      // Бесплатный доступ — ко всему
      if (profile.free_access) {
        setHasAccessToUpcoming(true)
        // Для карточек тоже ставим доступ
        const allIds = new Set(archivedStreams.map(s => s.id))
        if (upcomingStream) allIds.add(upcomingStream.id)
        setPaidStreamIds(allIds)
        return
      }

      // Получаем все completed-платежи пользователя
      const { data: payments } = await supabase
        .from('payments')
        .select('metadata')
        .eq('user_id', userId)
        .eq('status', 'completed')

      const paidIds = new Set<string>()
      payments?.forEach(p => {
        if (p.metadata?.stream_id) {
          paidIds.add(p.metadata.stream_id)
        }
      })

      setPaidStreamIds(paidIds)
      setHasAccessToUpcoming(upcomingStream ? paidIds.has(upcomingStream.id) : false)
    } catch (error) {
      console.error('Error checking access:', error)
    }
  }, [userId, profile, upcomingStream, archivedStreams])

  useEffect(() => {
    fetchStreams()
  }, [fetchStreams])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  function getAccessStatus(streamId: string): 'not_logged_in' | 'no_access' | 'has_access' {
    if (!userId) return 'not_logged_in'
    if (profile?.free_access) return 'has_access'
    if (paidStreamIds.has(streamId)) return 'has_access'
    return 'no_access'
  }

  // Фильтруем архив — не показываем upcoming в карточках
  const archiveCards = archivedStreams.filter(s => s.id !== upcomingStream?.id)

  return (
    <div className="flex flex-col">
      {/* Hero — ближайшее / текущее событие */}
      <EventBlock user={profile} hasAccess={hasAccessToUpcoming} streamData={upcomingStream} />

      {/* Архив записей */}
      {archiveCards.length > 0 && (
        <section className="bg-black py-12 md:py-20">
          <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-white font-bold text-2xl md:text-3xl">
                  Înregistrări anterioare
                </h2>
                <p className="text-white/40 text-sm mt-1">Spectacolele trecute disponibile pentru vizionare</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {archiveCards.map(stream => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  accessStatus={getAccessStatus(stream.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
