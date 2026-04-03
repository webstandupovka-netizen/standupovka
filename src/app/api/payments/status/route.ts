import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { MAIBPaymentService } from '@/lib/payments/maib'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const statusSchema = z.object({
  paymentId: z.string().optional(),
  orderId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const orderId = searchParams.get('orderId')

    const { paymentId: validatedPaymentId, orderId: validatedOrderId } = statusSchema.parse({
      paymentId,
      orderId
    })

    if (!validatedPaymentId && !validatedOrderId) {
      return NextResponse.json({ error: 'Payment ID or Order ID required' }, { status: 400 })
    }

    // Получаем платеж из базы данных
    let query = supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', user.id)

    if (validatedPaymentId) {
      query = query.eq('maib_transaction_id', validatedPaymentId)
    } else if (validatedOrderId) {
      query = query.eq('maib_order_id', validatedOrderId)
    }

    const { data: payment, error: paymentError } = await query.single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Если платеж еще в статусе pending или processing, проверяем статус в MAIB
    if ((payment.status === 'pending' || payment.status === 'processing') && payment.maib_transaction_id) {
      try {
        console.log('🔍 Checking MAIB status for payment:', payment.maib_transaction_id)
        const maibService = new MAIBPaymentService()
        const maibStatus = await maibService.getPaymentStatus(payment.maib_transaction_id)
        console.log('📊 MAIB status response:', maibStatus)

        // Обновляем статус в базе данных, если он изменился
        if (maibStatus.status !== payment.status) {
          console.log(`🔄 Status changed: ${payment.status} → ${maibStatus.status}`)
          const { error: updateError } = await supabaseAdmin
            .from('payments')
            .update({
              status: maibStatus.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id)

          if (!updateError) {
            payment.status = maibStatus.status
            console.log('✅ Payment status updated in database')
          } else {
            console.error('❌ Failed to update payment status:', updateError)
          }
        } else {
          console.log('ℹ️ Status unchanged:', payment.status)
        }
      } catch (error) {
        console.error('❌ Failed to check MAIB status:', error)
        // Продолжаем с текущим статусом из базы данных
      }
    } else {
      console.log('ℹ️ Skipping MAIB check - status:', payment.status, 'maib_transaction_id:', payment.maib_transaction_id)
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      orderId: payment.maib_order_id,
      payId: payment.maib_transaction_id,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      metadata: payment.metadata
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}