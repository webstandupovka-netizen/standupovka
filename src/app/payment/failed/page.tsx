'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2, RefreshCw, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

function PaymentFailedPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)

  const orderId = searchParams.get('orderId')
  const payId = searchParams.get('payId')
  const error = searchParams.get('error')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId && !payId) {
        setIsLoading(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (orderId) params.append('orderId', orderId)
        if (payId) params.append('paymentId', payId)

        const response = await fetch(`/api/payments/status?${params}`)
        const data = await response.json()

        if (response.ok) {
          setPaymentStatus(data)
        }
      } catch (error) {
        console.error('Failed to check payment status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [orderId, payId])

  const handleRetry = () => {
    router.push('/?retry=true')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const getErrorMessage = () => {
    if (error) {
      switch (error) {
        case 'cancelled':
          return 'Платеж был отменен'
        case 'declined':
          return 'Платеж был отклонен банком'
        case 'timeout':
          return 'Время ожидания платежа истекло'
        default:
          return 'Произошла ошибка при обработке платежа'
      }
    }
    return 'Платеж не был завершен'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificăm statusul plății...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[466px] bg-[#1B1B1B] border border-[#D61515] rounded-xl p-6 space-y-6"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center">
            <XCircle className="w-8 h-8 text-[#D61515]" />
          </div>
        </motion.div>

        {/* Title and Description */}
        <div className="text-center space-y-3">
          <h1 className="text-[32px] font-bold text-[#F2F2F2] leading-tight">
            Plata nu a fost efectuată!
          </h1>
          <p className="text-sm text-[#F2F2F2]">
            {getErrorMessage()}
          </p>
        </div>

        {/* Payment Details */}
        {paymentStatus && (
          <div className="bg-[#1B1B1B] border border-[#373737] rounded-xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#F2F2F2]">Suma:</span>
              <span className="text-lg font-black text-[#F2F2F2]">
                {paymentStatus.amount} {paymentStatus.currency}
              </span>
            </div>
            {paymentStatus.orderId && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#F2F2F2]">Număr comenzii:</span>
                <span className="text-sm font-semibold text-[#F2F2F2]">
                  {paymentStatus.orderId}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Help Information */}
        <div className="bg-[#1B1B1B] border border-[#373737] rounded-xl p-6">
          <p className="text-sm text-[#F2F2F2] font-bold mb-3">
            Ce să faceți în continuare?
          </p>
          <ul className="text-sm text-[#F2F2F2] space-y-2">
            <li>• Verificați datele cardului</li>
            <li>• Asigurați-vă că aveți fonduri suficiente</li>
            <li>• Încercați cu un alt card</li>
            <li>• Contactați banca dacă este necesar</li>
          </ul>
        </div>

        {/* Retry Button */}
        <Button 
          onClick={handleRetry} 
          className="w-full bg-[#D61515] hover:bg-[#B91212] text-white font-bold text-base uppercase py-3 rounded-xl border border-[#F2F2F2] flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          încearcă din nou
        </Button>

        {/* Back to Home */}
        <button 
          onClick={handleGoHome}
          className="flex items-center text-[#F2F2F2] font-bold text-sm"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          Principală
        </button>
      </motion.div>
    </div>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Se încarcă...</p>
        </div>
      </div>
    }>
      <PaymentFailedPageInner />
    </Suspense>
  )
}