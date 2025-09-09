import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('redirect') ?? '/'

  // Обработка ошибок из URL параметров
  if (error) {
    console.error('Auth callback URL error:', { error, errorCode, errorDescription })
    
    let errorMessage = 'auth_callback_error'
    
    if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
      errorMessage = 'otp_expired'
    } else if (error === 'access_denied') {
      errorMessage = 'access_denied'
    }
    
    return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
  }

  if (code) {
    const supabase = await createSupabaseServerClient()
    
    try {
      const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error('Supabase auth error:', authError)
        
        let errorMessage = 'auth_callback_error'
        
        if (authError.message?.includes('expired') || authError.message?.includes('invalid')) {
          errorMessage = 'otp_expired'
        }
        
        return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
      }
      
      if (data.user) {
        // Попытаемся создать профиль пользователя, если его еще нет
        try {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()

          if (!existingProfile) {
            // Создаем профиль пользователя
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (profileError) {
              console.error('Error creating user profile:', profileError)
            }
          }
        } catch (profileError) {
          console.error('Error handling user profile:', profileError)
        }
        
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
        return NextResponse.redirect(`${appUrl}${next}`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
    }
  }

  // Если произошла ошибка, перенаправляем на страницу входа с сообщением об ошибке
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}