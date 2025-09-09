'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFingerprint } from '@/lib/fingerprint'
import { getBaseUrl } from '@/lib/config'

interface AuthFormProps {
  redirectTo?: string
  onSuccess?: () => void
}

export function AuthForm({ redirectTo = '/', onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const emailInputRef = useRef<HTMLInputElement>(null)
  const { fingerprint, loading: fingerprintLoading } = useFingerprint()
  const supabase = createClient()

  // Автофокус на поле email
  useEffect(() => {
    if (emailInputRef.current && !isEmailSent) {
      emailInputRef.current.focus()
    }
  }, [isEmailSent])

  // Валидация email в реальном времени
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsValidEmail(emailRegex.test(email.trim()))
  }, [email])

  // Countdown для повторной отправки
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Определение популярных доменов для автодополнения
  const getEmailSuggestion = (email: string) => {
    const popularDomains = ['gmail.com', 'yandex.ru', 'mail.ru', 'outlook.com', 'yahoo.com']
    const [localPart, domain] = email.split('@')
    if (!domain || domain.length < 2) return null
    
    const suggestion = popularDomains.find(d => d.startsWith(domain.toLowerCase()))
    return suggestion ? `${localPart}@${suggestion}` : null
  }

  const emailSuggestion = getEmailSuggestion(email)



  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setEmailTouched(true)
    setMessage(null)
  }

  const handleSuggestionClick = () => {
    if (emailSuggestion) {
      setEmail(emailSuggestion)
      setEmailTouched(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Пожалуйста, введите email адрес' })
      return
    }

    if (!isValidEmail) {
      setMessage({ type: 'error', text: 'Пожалуйста, введите корректный email адрес' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Получаем отпечаток браузера для дополнительной безопасности
      const deviceFingerprint = fingerprint || 'unknown'
      
      // Используем наш кастомный API для отправки красивого письма
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: `${getBaseUrl()}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          data: {
            fingerprint: deviceFingerprint,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка отправки письма')
      }

      setIsEmailSent(true)
      setCountdown(60) // 60 секунд до возможности повторной отправки
      setMessage({
        type: 'success',
        text: `📧 Письмо с ссылкой для входа отправлено на ${email}`,
      })
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Auth error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Произошла ошибка при отправке ссылки. Попробуйте еще раз.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim() || countdown > 0) return
    
    setIsLoading(true)
    setMessage(null)

    try {
      const deviceFingerprint = fingerprint || 'unknown'
      
      // Используем наш кастомный API для повторной отправки
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: `${getBaseUrl()}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          data: {
            fingerprint: deviceFingerprint,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка отправки письма')
      }

      setCountdown(60)
      setMessage({
        type: 'success',
        text: '📧 Новое письмо отправлено на вашу почту',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Ошибка при повторной отправке.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="w-full max-w-[466px] mx-auto bg-[#1B1B1B] border border-[#10C23F] rounded-xl p-6">
          <CardHeader className="text-center pb-6 space-y-6">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-[56px] h-[56px] flex items-center justify-center">
                <img src="/mdi_email-check.svg" alt="Email Check" className="w-[56px] h-[56px]" />
              </div>
            </motion.div>
            <div className="space-y-3">
              <CardTitle className="text-[32px] font-bold text-[#F2F2F2] leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>
                E-mailul a fost trimis!
              </CardTitle>
              <CardDescription className="text-[14px] font-black text-[#F2F2F2] leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>
                Verificați-vă adresa de e-mail {email}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            

            <motion.div 
              className="bg-[#1B1B1B] p-4 rounded-xl border border-[#1557D6]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="text-[15px] font-bold text-[#F2F2F2] leading-[1.275] mb-2" style={{fontFamily: 'Onest, sans-serif'}}>Ce trebuie să faceți în continuare:</h4>
              <ul className="text-[12px] font-normal text-[#F2F2F2] space-y-2 leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>
                <li>Deschideți-vă adresa de e-mail</li>
                <li>Găsiți e-mailul de la Standup</li>
                <li>Faceți clic pe linkul de conectare</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleResend}
                disabled={isLoading || countdown > 0}
                className="w-full bg-[#D61515] hover:bg-[#B91515] disabled:bg-[#666666] text-[#F2F2F2] font-bold text-[16px] uppercase py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl leading-[1.275] cursor-pointer disabled:cursor-not-allowed border border-[#F2F2F2]"
                style={{fontFamily: 'Onest, sans-serif'}}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Se trimite...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <img src="/em.svg" alt="" className="w-6 h-6" />
                    Repetați după {countdown} secunde
                  </>
                ) : (
                  <>
                    <img src="/em.svg" alt="" className="w-6 h-6" />
                    Trimiteți din nou
                  </>
                )}
              </Button>
            </motion.div>
            
            <Button
              variant="ghost"
              onClick={() => {
                setIsEmailSent(false)
                setMessage(null)
                setCountdown(0)
              }}
              className="w-full text-[#F2F2F2] hover:bg-[#2A2A2A] transition-all duration-200 text-[14px] font-bold leading-[1.275] cursor-pointer flex items-center justify-center gap-2"
              style={{fontFamily: 'Onest, sans-serif'}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#F2F2F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Schimbați adresa de e-mail
            </Button>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 space-y-4"
            >
              <div className="flex items-center justify-center gap-[14px]">
                <div className="flex items-center gap-1">
                  <img src="/shield-icon.svg" alt="Sigur" className="w-6 h-6" />
                  <span className="text-[12px] font-normal text-[#939393] uppercase leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>Sigur</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="/speed-icon.svg" alt="Rapid" className="w-6 h-6" />
                  <span className="text-[12px] font-normal text-[#939393] uppercase leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>Rapid</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="/password-icon.svg" alt="Fără parole" className="w-6 h-6" />
                  <span className="text-[12px] font-normal text-[#939393] uppercase leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>Fără parole</span>
                </div>
              </div>
              <p className="text-center text-[12px] font-normal text-[#939393] leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>
                Nici o parolă — tot ce trebuie să faceți este să verificați e-mailul!
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="w-full max-w-[466px] mx-auto bg-[#1B1B1B] border border-white rounded-xl p-6">
        <CardHeader className="text-center pb-6 space-y-3">
          <CardTitle className="text-[32px] font-bold text-white leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>
            Bun venit!
          </CardTitle>
          <CardDescription className="text-[14px] font-black text-white uppercase leading-[1.275] tracking-wide" style={{fontFamily: 'Onest, sans-serif'}}>
            Vă rugăm să introduceți un link către e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-[12px] font-normal text-[#F2F2F2] leading-[1.275] text-center block" style={{fontFamily: 'Onest, sans-serif'}}>
                Adresă e-mail:
              </Label>
              <div className="relative">
                <Input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading || fingerprintLoading}
                  required
                  className="w-full h-auto py-4 px-3 text-[14px] font-medium text-[#F2F2F2] bg-transparent border border-[#F2F2F2] rounded-xl placeholder:text-[#F2F2F2] leading-[1.275] focus:border-[#F2F2F2] focus:ring-0"
                  style={{fontFamily: 'Onest, sans-serif'}}
                />
                {emailTouched && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {isValidEmail ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-red-300" />
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Автодополнение email */}
              <AnimatePresence>
                {emailSuggestion && email.includes('@') && emailSuggestion !== email && (
                  <motion.button
                    type="button"
                    onClick={handleSuggestionClick}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors duration-200"
                  >
                    <span className="text-gray-600">Poate ați vrut să spuneți: </span>
                    <span className="font-medium text-blue-600">{emailSuggestion}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading || fingerprintLoading || !email.trim() || !isValidEmail}
                className="w-full bg-[#E31E24] hover:bg-[#C41E3A] disabled:bg-[#666666] text-white font-bold text-[16px] uppercase py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl leading-[1.275] cursor-pointer disabled:cursor-not-allowed"
                style={{fontFamily: 'Onest, sans-serif'}}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <img src="/email-icon.svg" alt="Email" className="w-6 h-6" />
                    obțineți linkul de conectare
                  </>
                )}
              </Button>
            </motion.div>

            {fingerprintLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center space-x-2 text-xs text-gray-500"
              >
                <Loader2 className="w-3 h-3 animate-pulse" />
                <span>Inițializarea protecției...</span>
              </motion.div>
            )}
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 space-y-4"
          >
            <div className="flex items-center justify-center gap-[14px]">
              <div className="flex items-center gap-1">
                <img src="/shield-icon.svg" alt="Sigur" className="w-6 h-6" />
                <span className="text-[12px] font-normal text-[#939393] uppercase leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>Sigur</span>
              </div>
              <div className="flex items-center gap-1">
                <img src="/speed-icon.svg" alt="Rapid" className="w-6 h-6" />
                <span className="text-[12px] font-normal text-[#939393] uppercase leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>Rapid</span>
              </div>
              <div className="flex items-center gap-1">
                <img src="/password-icon.svg" alt="Fără parole" className="w-6 h-6" />
                <span className="text-[12px] font-normal text-[#939393] uppercase leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>Fără parole</span>
              </div>
            </div>
            <p className="text-center text-[12px] font-normal text-[#939393] leading-[1.275]" style={{fontFamily: 'Onest, sans-serif'}}>
              Nici o parolă — tot ce trebuie să faceți este să verificați e-mailul!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}