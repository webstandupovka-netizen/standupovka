'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/auth/client-config'
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
        // Если профиль не найден, попытаемся создать его
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...')
          
          // Проверяем, не существует ли уже профиль
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', userId)
            .single()
            
          if (!existingProfile) {
            // Получаем данные пользователя
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            
            if (currentUser) {
              const { data: newProfile, error: createError } = await supabase
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

              if (createError) {
                console.error('Error creating profile:', createError)
                setError('Failed to create user profile')
                return
              }

              setProfile(newProfile)
              return
            }
          }
        }
        
        console.error('Error fetching profile:', error)
        setError('Failed to fetch user profile')
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Profile fetch error:', err)
      setError('Failed to fetch user profile')
    }
  }, [])

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError('Failed to sign out')
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (err) {
      setError('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function getUserData() {
      if (!isMounted) return;
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (isMounted) {
          if (user) {
            setUser(user);
            await fetchProfile(user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (e) {
        if(isMounted) setError('Failed to get user data');
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    getUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          getUserData();
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return {
    user,
    profile,
    loading,
    error,
    signOut,
    refreshProfile
  }
}