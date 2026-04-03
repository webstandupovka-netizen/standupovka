import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email/service'
import { z } from 'zod'

const sendEmailSchema = z.object({
  paymentId: z.string().uuid(),
  userEmail: z.string().email().optional(),
  streamId: z.string().uuid().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, userEmail, streamId } = sendEmailSchema.parse(body)

    // Получаем информацию о платеже
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        user_profiles!inner(full_name, email)
      `)
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found or not completed' }, { status: 404 })
    }

    // Получаем информацию о стриме
    let streamData = null
    if (streamId || payment.metadata?.stream_id) {
      const { data: stream } = await supabaseAdmin
        .from('stream_settings')
        .select('*')
        .eq('id', streamId || payment.metadata.stream_id)
        .single()
      
      streamData = stream
    }

    // Подготавливаем данные для email
    const recipientEmail = userEmail || payment.user_profiles.email
    const userFirstname = payment.user_profiles.full_name?.split(' ')[0] || 'Пользователь'
    
    // Форматируем дату и время
    let streamDate = '21 сентября 2025'
    let streamTime = '20:00'
    
    if (streamData?.stream_start_time) {
      const startTime = new Date(streamData.stream_start_time)
      streamDate = startTime.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      streamTime = startTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Отправляем email
    const emailSent = await emailService.sendPaymentSuccessEmail({
      userEmail: recipientEmail,
      userFirstname,
      streamTitle: streamData?.title || payment.metadata?.stream_title || 'Стендап Вечер',
      streamDate,
      streamTime,
      amount: payment.amount,
      currency: payment.currency,
      userId: user.id
    })

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Payment success email sent successfully',
      recipient: recipientEmail
    })

  } catch (error) {
    console.error('Email sending error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.issues 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}