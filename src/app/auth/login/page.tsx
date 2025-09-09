import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { Loader2 } from 'lucide-react'
import Script from 'next/script'

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = params.redirect || '/'
  const error = params.error

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
      {/* Скрипт для исправления проблемы с хэш-фрагментом в URL */}
      <Script src="/auth/login/fix-hash-fragment.js" strategy="beforeInteractive" />
      
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error === 'auth_callback_error' && (
              <>
                <strong>Eroare de autentificare:</strong> Nu s-a putut finaliza procesul de autentificare. 
                Este posibil să aveți un stream deschis pe alt dispozitiv - închideți-l și încercați din nou. 
                Dacă problema persistă, contactați suportul.
              </>
            )}
            {error === 'access_denied' && (
              <>
                <strong>Acces interzis:</strong> Autentificarea a fost anulată sau a apărut o eroare.
              </>
            )}
            {error === 'otp_expired' && (
              <>
                <strong>Link expirat:</strong> Linkul de autentificare a expirat. 
                Vă rugăm să solicitați un nou link de conectare.
              </>
            )}
          </div>
        )}
        
        <Suspense 
          fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <AuthForm redirectTo={redirectTo} />
        </Suspense>
      </div>
    </div>
  )
}