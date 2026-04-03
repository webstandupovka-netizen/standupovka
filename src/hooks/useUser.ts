'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types/database'

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const supabase = createClient()

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Профиль не найден — создаём
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser) {
            const { data: newProfile } = await supabase
              .from('user_profiles')
              .insert({
                id: userId,
                email: currentUser.email || '',
                full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()

            if (newProfile) {
              setProfile(newProfile)
              return
            }
          }
        }
        return
      }

      setProfile(data)
    } catch {
      // Молча игнорируем — не блокируем UI
    }
  }, [])

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setError(null)
    } catch {
      setError('Failed to sign out')
    }
    // НЕ ставим loading — signOut не должен показывать спиннер
  }

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!isMounted) return

        if (user) {
          setUser(user)
          await fetchProfile(user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch {
        // Нет сессии или сеть недоступна — просто не авторизован
        if (isMounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (!isMounted) return

        if (event === 'SIGNED_OUT') {
          // Sign out — сразу чистим без повторного запроса к серверу
          setUser(null)
          setProfile(null)
          setLoading(false)
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          loadUser()
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return { user, profile, loading, error, signOut, refreshProfile }
}
