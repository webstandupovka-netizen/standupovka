import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email/service'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const magicLinkSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url().optional(),
  data: z.object({
    fingerprint: z.string().optional(),
    userAgent: z.string().optional(),
    timestamp: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, redirectTo, data } = magicLinkSchema.parse(body)

    // Генерируем magic link через Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: redirectTo || 'https://www.standupovka.live/auth/callback',
        data
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: 'Ошибка генерации ссылки для входа' },
        { status: 500 }
      )
    }

    if (!authData.properties?.action_link) {
      return NextResponse.json(
        { error: 'Не удалось сгенерировать ссылку' },
        { status: 500 }
      )
    }

    // Отправляем красивое письмо через наш email сервис
    const emailSent = await emailService.sendMagicLinkEmail({
      userEmail: email,
      magicLink: authData.properties.action_link,
      expiresIn: '1 oră'
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Ошибка отправки письма' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ссылка для входа отправлена на ваш email'
    })

  } catch (error) {
    console.error('Magic link API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные запроса', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}