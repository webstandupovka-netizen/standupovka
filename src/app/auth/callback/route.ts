import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  const rawRedirect = searchParams.get('redirect') ?? '/'
  const next = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/'

  // Также проверяем access_token (некоторые email-клиенты передают через query)
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  // Обработка ошибок — но только если нет токенов
  if (error && !code && !token_hash && !accessToken) {
    let errorMessage = 'auth_callback_error'
    if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
      errorMessage = 'otp_expired'
    } else if (error === 'access_denied') {
      errorMessage = 'access_denied'
    }
    return NextResponse.redirect(`${origin}/auth/login?error=${errorMessage}`)
  }

  const supabase = await createSupabaseServerClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin

  // Flow 1: PKCE — обмен кода на сессию
  if (code) {
    try {
      const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
      if (!authError && data.user) {
        await ensureProfile(supabase, data.user)
        return NextResponse.redirect(`${appUrl}${next}`)
      }
      const msg = authError?.message?.includes('expired') ? 'otp_expired' : 'auth_callback_error'
      return NextResponse.redirect(`${origin}/auth/login?error=${msg}`)
    } catch {
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
    }
  }

  // Flow 2: Token hash (magic link через admin.generateLink)
  if (token_hash && type) {
    try {
      const { data, error: authError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })
      if (!authError && data.user) {
        await ensureProfile(supabase, data.user)
        return NextResponse.redirect(`${appUrl}${next}`)
      }
      const msg = authError?.message?.includes('expired') ? 'otp_expired' : 'auth_callback_error'
      return NextResponse.redirect(`${origin}/auth/login?error=${msg}`)
    } catch {
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
    }
  }

  // Flow 3: Access token (fallback — некоторые email-клиенты)
  if (accessToken) {
    try {
      const { data, error: authError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      })
      if (!authError && data.user) {
        await ensureProfile(supabase, data.user)
        return NextResponse.redirect(`${appUrl}${next}`)
      }
    } catch {
      // fallthrough to error
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}

// Создаёт профиль пользователя если не существует
async function ensureProfile(supabase: any, user: any) {
  try {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existing) {
      await supabase.from('user_profiles').insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  } catch {
    // Не блокируем auth из-за ошибки профиля
  }
}
