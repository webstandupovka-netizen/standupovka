'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'

interface CloseStreamButtonProps {
  streamId?: string
  className?: string
  variant?: string
  size?: string
}

export function CloseStreamButton({
  streamId,
  className = '',
}: CloseStreamButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleCloseStream = async () => {
    try {
      setIsLoading(true)
      await fetch('/api/stream/close-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, reason: 'user_request' })
      })
      router.push('/')
    } catch (error) {
      console.error('Error closing stream:', error)
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        className={`text-white/40 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Închide</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h2 className="text-gray-900 font-bold text-lg mb-2">
              Închideți transmisiunea?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Sesiunea curentă va fi închisă. Puteți reveni oricând dacă aveți acces activ.
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
                disabled={isLoading}
                onClick={() => setIsOpen(false)}
              >
                Anulează
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={handleCloseStream}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Închide'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
