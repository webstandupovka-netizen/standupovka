'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Shield, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase-client'

interface PaymentFormProps {
  streamId: string
  streamTitle: string
  price: number
  currency: string
  onSuccess?: () => void
}

export function PaymentForm({ streamId, streamTitle, price, currency, onSuccess }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [returnUrl, setReturnUrl] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Проверяем аутентификацию
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Сохраняем полный URL с параметрами при редиректе на логин
        const currentUrl = window.location.pathname + window.location.search
        router.push('/auth/login?redirect=' + encodeURIComponent(currentUrl))
        return
      }

      // Создаем платеж
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId,
          returnUrl: returnUrl || undefined,
          failUrl: window.location.origin + '/payment/failed'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'Payment already completed') {
          router.push('/stream')
          return
        }
        throw new Error(data.error || 'Ошибка создания платежа')
      }

      // Перенаправляем на страницу оплаты MAIB
      if (data.payUrl || data.paymentUrl) {
        window.location.href = data.payUrl || data.paymentUrl
      } else {
        throw new Error('Не получена ссылка для оплаты')
      }

    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-5 w-5" />
            Оплата доступа
          </CardTitle>
          <CardDescription>
            {streamTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Информация о платеже */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Стоимость:</span>
              <span className="text-lg font-bold">
                {price} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Доступ:</span>
              <span className="text-sm font-medium">Безлимитный просмотр</span>
            </div>
          </div>

          {/* Дополнительные настройки */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="returnUrl" className="text-sm">
                URL возврата (необязательно)
              </Label>
              <Input
                id="returnUrl"
                type="url"
                placeholder="https://example.com/success"
                value={returnUrl}
                onChange={(e) => setReturnUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Страница, на которую вы будете перенаправлены после успешной оплаты
              </p>
            </div>
          </div>

          {/* Информация о безопасности */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Безопасная оплата</h4>
                <p className="text-xs text-blue-700 mt-1">
                  Платеж обрабатывается через защищенную систему MAIB. 
                  Ваши данные карты не сохраняются на наших серверах.
                </p>
              </div>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Кнопка оплаты */}
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Создание платежа...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Оплатить {price} {currency}
              </>
            )}
          </Button>

          {/* Дополнительная информация */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Доступ активируется сразу после оплаты</span>
            </div>
            <p className="text-xs text-gray-500">
              Нажимая "Оплатить", вы соглашаетесь с условиями использования
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}