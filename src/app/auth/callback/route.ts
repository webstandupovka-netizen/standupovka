import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('redirect') ?? '/'

  if (code) {
    const supabase = await createSupabaseServerClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user) {
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
    }
  }

  // Если произошла ошибка, перенаправляем на страницу входа с сообщением об ошибке
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}