'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useUser } from '@/hooks/useUser'
import { EventBlock } from '@/components/event-block'



const supabase = createClient()

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [streamData, setStreamData] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState(false)
  
  const { user, profile, loading } = useUser()
  const userId = user?.id

  const fetchStreamData = useCallback(async () => {
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
  }, [])

  const checkUserAccess = useCallback(async () => {
    if (!userId || !profile) {
      setHasAccess(false)
      return
    }
    
    try {
      // Проверяем бесплатный доступ пользователя
      if (profile.free_access) {
        setHasAccess(true)
        return
      }

      // Если нет бесплатного доступа, проверяем платежи
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .single()

      setHasAccess(!!payment)
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    }
  }, [userId, profile])

  useEffect(() => {
    setIsClient(true)
    fetchStreamData()
  }, [fetchStreamData])

  useEffect(() => {
    checkUserAccess()
  }, [checkUserAccess])



  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Se încarcă...</p>
        </div>
      </div>
    )
  }

  return (
    <EventBlock user={profile} hasAccess={hasAccess} />
  )
}
