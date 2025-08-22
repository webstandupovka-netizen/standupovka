import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { Loader2 } from 'lucide-react'

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
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error === 'auth_callback_error' && (
              <>
                <strong>Ошибка входа:</strong> Не удалось завершить процесс аутентификации. 
                Попробуйте войти снова или обратитесь в поддержку.
              </>
            )}
            {error === 'access_denied' && (
              <>
                <strong>Доступ запрещен:</strong> Вход был отменен или произошла ошибка.
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