import { NextRequest, NextResponse } from 'next/server'
import { createServerClientAuth } from '@/lib/auth/config'
import { MAIBPaymentService } from '@/lib/payments/maib'
import { supabaseServer } from '@/lib/database/client'
import { z } from 'zod'

const createPaymentSchema = z.object({
  streamId: z.string().uuid(),
  returnUrl: z.string().url().optional(),
  failUrl: z.string().url().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientAuth()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { streamId, returnUrl, failUrl } = createPaymentSchema.parse(body)

    // Получаем IP клиента
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'

    // Получаем информацию о стриме
    const { data: stream, error: streamError } = await supabaseServer
      .from('stream_settings')
      .select('*')
      .eq('id', streamId)
      .eq('is_active', true)
      .single()

    if (streamError || !stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Проверяем, нет ли уже оплаченного заказа
    const { data: existingPayment } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .single()

    if (existingPayment) {
      return NextResponse.json({ 
        error: 'Payment already completed',
        streamUrl: '/stream'
      }, { status: 400 })
    }

    // Создаем заказ в нашей БД
    const orderId = `order_${Date.now()}_${session.user.id.slice(0, 8)}`
    
    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .insert({
        user_id: session.user.id,
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
    const { data: profile } = await supabaseServer
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
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
      clientName: profile?.full_name || session.user.email?.split('@')[0],
      email: session.user.email!,
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
      await supabaseServer
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
    await supabaseServer
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