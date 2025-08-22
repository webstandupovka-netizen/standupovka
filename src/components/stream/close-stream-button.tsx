'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

interface CloseStreamButtonProps {
  streamId?: string
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function CloseStreamButton({ 
  streamId, 
  className = '',
  variant = 'outline',
  size = 'default'
}: CloseStreamButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleCloseStream = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/stream/close-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          streamId,
          reason: 'user_request'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close stream')
      }

      console.log('Stream closed successfully:', data)

      // Перенаправляем на главную страницу
      router.push('/')
      
    } catch (error) {
      console.error('Error closing stream:', error)
      console.error('Failed to close stream:', error)
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={`text-red-400 border-red-400 hover:bg-red-400 hover:text-white ${className}`}
        disabled={isLoading}
        onClick={() => setIsOpen(true)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4 mr-2" />
        )}
        Închide transmisia
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">
              Închide transmisia?
            </h2>
            <p className="text-gray-300 mb-6">
              Это действие завершит вашу текущую сессию просмотра и закроет доступ к трансляции на всех устройствах. 
              Вы сможете вернуться к просмотру позже, если у вас есть активный доступ.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline"
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
                onClick={() => setIsOpen(false)}
              >
                Anulează
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
                onClick={handleCloseStream}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Se închide...
                  </>
                ) : (
                  'Închide transmisia'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}