'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
      setMessage({ type: 'error', text: 'Vă rugăm să introduceți adresa de email' })
      return
    }

    if (!isValidEmail) {
      setMessage({ type: 'error', text: 'Vă rugăm să introduceți o adresă de email validă' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Получаем отпечаток браузера для дополнительной безопасности
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: `${getBaseUrl()}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Eroare la trimiterea emailului')
      }

      setIsEmailSent(true)
      setCountdown(60) // 60 de secunde până la posibilitatea de retrimitere
      setMessage({
        type: 'success',
        text: `📧 Emailul cu linkul de conectare a fost trimis la ${email}`,
      })
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Auth error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'A apărut o eroare la trimiterea linkului. Încercați din nou.',
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
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          redirectTo: `${getBaseUrl()}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Eroare la trimiterea emailului')
      }

      setCountdown(60)
      setMessage({
        type: 'success',
        text: '📧 Un nou email a fost trimis la adresa dvs.',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Eroare la retrimitere.',
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
        <div className="w-full max-w-[440px] mx-auto bg-white rounded-2xl p-8 shadow-2xl shadow-black/20">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">E-mailul a fost trimis!</h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Verificați <span className="font-semibold text-gray-700">{email}</span>
          </p>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Ce trebuie să faceți:</p>
            <div className="space-y-2.5">
              {['Deschideți e-mailul', 'Găsiți mesajul de la Standupovka', 'Faceți clic pe link'].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                  <span className="text-sm text-gray-600">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white disabled:text-gray-500 font-semibold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer disabled:cursor-not-allowed mb-3"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Se trimite...
              </span>
            ) : countdown > 0 ? (
              `Retrimiteți după ${countdown}s`
            ) : (
              'Trimiteți din nou'
            )}
          </button>

          <button
            onClick={() => { setIsEmailSent(false); setMessage(null); setCountdown(0) }}
            className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors cursor-pointer"
          >
            ← Schimbați adresa de e-mail
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="w-full max-w-[440px] mx-auto bg-white rounded-2xl p-8 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bun venit!</h2>
          <p className="text-gray-500 text-sm">Introduceți e-mailul pentru a primi linkul de conectare</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1.5">
              Adresă e-mail
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                required
                className="w-full py-3.5 px-4 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all disabled:opacity-50"
              />
              {emailTouched && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {isValidEmail ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </motion.div>
              )}
            </div>

            {/* Email suggestion */}
            <AnimatePresence>
              {emailSuggestion && email.includes('@') && emailSuggestion !== email && (
                <motion.button
                  type="button"
                  onClick={handleSuggestionClick}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 w-full text-left px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors cursor-pointer"
                >
                  <span className="text-gray-500">Poate: </span>
                  <span className="font-semibold text-blue-600">{emailSuggestion}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !isValidEmail}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 font-semibold text-sm py-3.5 px-6 rounded-xl transition-all duration-200 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Se trimite...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Obțineți linkul de conectare
              </>
            )}
          </button>
        </form>

        {/* Trust badges */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs">Sigur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs">Rapid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-xs">Fără parole</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Nici o parolă — verificați doar e-mailul!
          </p>
        </div>
      </div>
    </motion.div>
  )
}