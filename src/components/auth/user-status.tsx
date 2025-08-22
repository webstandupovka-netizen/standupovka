'use client'

import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, LogOut, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/auth/client-config'

interface UserStatusProps {
  showDetails?: boolean
  className?: string
}

export function UserStatus({ showDetails = true, className = '' }: UserStatusProps) {
  const { user, profile, loading, signOut } = useUser()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const supabase = createClient()

  const checkStreamAccess = useCallback(async () => {
    if (!user) return
    
    setCheckingAccess(true)
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
    } finally {
      setCheckingAccess(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      checkStreamAccess()
    }
  }, [user, checkStreamAccess])

  const handleSignOut = async () => {
    try {
      await signOut()
      setHasAccess(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading || checkingAccess) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-[#10C23F]" />
        <span className="text-sm text-[#CCCCCC]">Se încarcă...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <User className="h-4 w-4 text-[#CCCCCC]" />
        <span className="text-sm text-[#CCCCCC]">Neautentificat</span>
      </div>
    )
  }

  if (!showDetails) {
    return (
      <div className={`${className}`}>
        <p className="text-[#CCCCCC] text-xs">{user.email}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-[#10C23F]/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-[#10C23F]" />
          </div>
          <div>
            <p className="font-medium text-[#F2F2F2]">{user.email}</p>
            <p className="text-sm text-[#CCCCCC]">Autentificat</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasAccess !== null && (
            <Badge 
              className={`flex items-center space-x-1 ${
                hasAccess 
                  ? 'bg-[#10C23F]/20 text-[#10C23F] border-[#10C23F]/30' 
                  : 'bg-[#D61515]/20 text-[#D61515] border-[#D61515]/30'
              }`}
            >
              {hasAccess ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <span>{hasAccess ? 'Acces disponibil' : 'Fără acces'}</span>
            </Badge>
          )}
          
          <Button
             variant="outline"
             size="sm"
             onClick={signOut}
             className="flex items-center space-x-1 border-[#333333] text-[#F2F2F2] hover:bg-[#333333]"
           >
             <LogOut className="h-3 w-3" />
             <span>Ieșire</span>
           </Button>
        </div>
      </div>
      
      {hasAccess === false && (
        <div className="bg-[#D61515]/10 border border-[#D61515]/30 rounded-lg p-3">
          <p className="text-sm text-[#F2F2F2]">
            Nu aveți acces la transmisie. Vă rugăm să achiziționați un bilet.
          </p>
        </div>
      )}
    </div>
  )
}