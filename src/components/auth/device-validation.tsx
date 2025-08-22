'use client'

import { useEffect, useState } from 'react'
import { useDeviceValidation } from '@/lib/auth/fingerprint'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

interface DeviceValidationProps {
  userId: string
  onValidationComplete?: (isValid: boolean) => void
}

export function DeviceValidation({ userId, onValidationComplete }: DeviceValidationProps) {
  const { isValidating, isValidDevice, error, validateDevice } = useDeviceValidation()
  const [hasValidated, setHasValidated] = useState(false)

  useEffect(() => {
    if (userId && !hasValidated) {
      validateDevice(userId)
      setHasValidated(true)
    }
  }, [userId, validateDevice, hasValidated])

  useEffect(() => {
    if (isValidDevice !== null && onValidationComplete) {
      onValidationComplete(isValidDevice)
    }
  }, [isValidDevice, onValidationComplete])

  const handleRetryValidation = () => {
    setHasValidated(false)
  }

  if (isValidating) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            Проверка устройства...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetryValidation}
          >
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (isValidDevice === false) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Устройство не прошло валидацию. Возможно, достигнут лимит активных устройств.
        </AlertDescription>
      </Alert>
    )
  }

  if (isValidDevice === true) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Устройство успешно валидировано
        </AlertDescription>
      </Alert>
    )
  }

  return null
}