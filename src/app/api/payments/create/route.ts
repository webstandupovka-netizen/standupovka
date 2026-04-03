import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { MAIBPaymentService } from '@/lib/payments/maib'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const createPaymentSchema = z.object({
  streamId: z.string().uuid(),
  returnUrl: z.string().url().optional(),
  failUrl: z.string().url().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId, returnUrl, failUrl } = createPaymentSchema.parse(body)

    // Получаем IP клиента
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'

    // Получаем информацию о стриме
    const { data: stream, error: streamError } = await supabaseAdmin
      .from('stream_settings')
      .select('*')
      .eq('id', streamId)
      .eq('is_active', true)
      .single()

    if (streamError || !stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Проверяем, нет ли уже оплаченного заказа для этого стрима
    const { data: completedPayment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .contains('metadata', { stream_id: streamId })
      .single()

    if (completedPayment) {
      return NextResponse.json({
        error: 'Payment already completed',
        streamUrl: '/stream'
      }, { status: 400 })
    }

    // Автоматически отменяем старые pending/processing платежи (>30 мин)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    await supabaseAdmin
      .from('payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .lt('created_at', thirtyMinAgo)

    // Создаем заказ в нашей БД
    const orderId = `order_${Date.now()}_${user.id.slice(0, 8)}`
    
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        amount: stream.price,
        currency: stream.currency,
        status: 'pending',
        maib_order_id: orderId,
        metadata: {
          stream_id: streamId,
          stream_title: stream.title
        }
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }

    // Получаем профиль пользователя
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Создаем платеж в MAIB
    const maibService = new MAIBPaymentService()
    
    console.log('🔄 Creating MAIB payment for order:', orderId)
    
    const maibPayment = await maibService.createPayment({
      amount: stream.price,
      currency: stream.currency,
      clientIp: clientIp.split(',')[0].trim(),
      language: 'ru',
      description: `Оплата за просмотр: ${stream.title}`,
      clientName: profile?.full_name || user.email?.split('@')[0],
      email: user.email!,
      phone: profile?.phone,
      orderId,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      okUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      failUrl: failUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`
    })

    console.log('📋 MAIB payment response:', JSON.stringify(maibPayment, null, 2))

    if (!maibPayment.ok || !maibPayment.result) {
      console.error('❌ MAIB payment creation failed:', maibPayment.errors)
      
      // Обновляем статус платежа на failed
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

      return NextResponse.json({ 
        error: 'Payment creation failed',
        details: maibPayment.errors 
      }, { status: 400 })
    }

    console.log('✅ MAIB payment created successfully:', maibPayment.result.payId)

    // Обновляем платеж с информацией от MAIB
    await supabaseAdmin
      .from('payments')
      .update({
        maib_transaction_id: maibPayment.result.payId,
        status: 'processing'
      })
      .eq('id', payment.id)

    return NextResponse.json({
      payUrl: maibPayment.result.payUrl,
      payId: maibPayment.result.payId,
      orderId: maibPayment.result.orderId
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}