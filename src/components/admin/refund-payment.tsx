'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, X } from 'lucide-react'

interface RefundPaymentProps {
  payment: {
    id: string
    amount: number | null
    currency: string
    maib_order_id: string | null | undefined
    status: string
    metadata?: {
      refund_status?: string
      refund_amount?: number
    } | null
  }
  onRefundComplete?: () => void
}

export function RefundPayment({ payment, onRefundComplete }: RefundPaymentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [isFullRefund, setIsFullRefund] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isRefunded = payment.status === 'refunded' || payment.metadata?.refund_status === 'refunded'
  const isPartiallyRefunded = payment.metadata?.refund_status === 'partially_refunded'
  const canRefund = payment.status === 'completed' && !isRefunded && payment.maib_order_id

  const handleRefund = async () => {
    if (!canRefund) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const requestBody: any = {
        paymentId: payment.id
      }

      if (!isFullRefund && refundAmount) {
        const amount = parseFloat(refundAmount)
        const paymentAmount = payment.amount || 0
        if (amount <= 0 || amount > paymentAmount) {
          setError('Неверная сумма возврата')
          setIsLoading(false)
          return
        }
        requestBody.refundAmount = amount
      }

      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при выполнении возврата')
      }

      setSuccess(`Возврат выполнен успешно. Сумма: ${data.refund.refundAmount} ${payment.currency}`)
      
      // Закрываем диалог через 2 секунды
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
        onRefundComplete?.()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setRefundAmount('')
    setIsFullRefund(true)
    setError(null)
    setSuccess(null)
  }

  if (!canRefund) {
    return (
      <Button variant="outline" size="sm" disabled className="border-gray-600 text-gray-400">
        {isRefunded ? 'Возвращен' : isPartiallyRefunded ? 'Частично возвращен' : 'Недоступен'}
      </Button>
    )
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Возврат
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-gray-800 border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Возврат платежа</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  resetForm()
                }}
                disabled={isLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-4 text-sm text-gray-300">
              <p>Заказ: {payment.maib_order_id}</p>
              <p>Сумма платежа: {payment.amount} {payment.currency}</p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Тип возврата</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isFullRefund ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsFullRefund(true)}
                    disabled={isLoading}
                    className={isFullRefund ? "" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                  >
                    Полный возврат
                  </Button>
                  <Button
                    type="button"
                    variant={!isFullRefund ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsFullRefund(false)}
                    disabled={isLoading}
                    className={!isFullRefund ? "" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                  >
                    Частичный возврат
                  </Button>
                </div>
              </div>

              {!isFullRefund && (
                <div className="space-y-2">
                  <Label htmlFor="refundAmount" className="text-white">Сумма возврата</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={payment.amount || 0}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Максимум: ${payment.amount || 0}`}
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    resetForm()
                  }}
                  disabled={isLoading}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  onClick={handleRefund}
                  disabled={isLoading || (!isFullRefund && !refundAmount)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Выполнить возврат
                </Button>
              </div>
          </Card>
        </div>
      )}
    </>
  )
}