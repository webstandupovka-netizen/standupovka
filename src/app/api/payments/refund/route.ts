import { NextRequest, NextResponse } from 'next/server'
import { createServerClientAuth } from '@/lib/auth/config'
import { MAIBPaymentService } from '@/lib/payments/maib'
import { supabaseServer } from '@/lib/database/client'
import { z } from 'zod'

const refundSchema = z.object({
  paymentId: z.string().uuid(),
  refundAmount: z.number().positive().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientAuth()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, refundAmount } = refundSchema.parse(body)

    // Получаем платеж из базы данных
    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', session.user.id)
      .eq('status', 'completed')
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ 
        error: 'Payment not found or not eligible for refund' 
      }, { status: 404 })
    }

    // Проверяем, не был ли платеж уже возвращен
    if (payment.metadata?.refund_status === 'refunded' || payment.metadata?.refund_status === 'partially_refunded') {
      return NextResponse.json({ 
        error: 'Payment has already been refunded' 
      }, { status: 400 })
    }

    // Проверяем сумму возврата
    if (refundAmount && refundAmount > payment.amount) {
      return NextResponse.json({ 
        error: 'Refund amount cannot exceed payment amount' 
      }, { status: 400 })
    }

    if (!payment.maib_transaction_id) {
      return NextResponse.json({ 
        error: 'Payment does not have MAIB transaction ID' 
      }, { status: 400 })
    }

    // Выполняем возврат через MAIB
    const maibService = new MAIBPaymentService()
    
    console.log(`🔄 Processing refund for payment ${paymentId}, MAIB payId: ${payment.maib_transaction_id}`)
    
    const refundResult = await maibService.refundPayment({
      payId: payment.maib_transaction_id,
      refundAmount
    })

    console.log('📋 MAIB refund response:', JSON.stringify(refundResult, null, 2))

    if (!refundResult.ok || !refundResult.result) {
      console.error('❌ MAIB refund failed:', refundResult.errors)
      return NextResponse.json({ 
        error: 'Refund failed',
        details: refundResult.errors 
      }, { status: 400 })
    }

    // Определяем статус возврата
    const isFullRefund = !refundAmount || refundAmount === payment.amount
    const refundStatus = isFullRefund ? 'refunded' : 'partially_refunded'
    const actualRefundAmount = refundResult.result.refundAmount

    // Обновляем платеж в базе данных
    const { data: updatedPayment, error: updateError } = await supabaseServer
      .from('payments')
      .update({
        status: isFullRefund ? 'refunded' : 'completed',
        updated_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          refund_status: refundStatus,
          refund_amount: actualRefundAmount,
          refund_date: new Date().toISOString(),
          maib_refund_response: {
            payId: refundResult.result.payId,
            orderId: refundResult.result.orderId,
            status: refundResult.result.status,
            statusCode: refundResult.result.statusCode,
            statusMessage: refundResult.result.statusMessage
          }
        }
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update payment after refund:', updateError)
      return NextResponse.json({ 
        error: 'Refund processed but failed to update database' 
      }, { status: 500 })
    }

    console.log(`✅ Refund processed successfully for payment ${paymentId}`)

    return NextResponse.json({
      success: true,
      refund: {
        paymentId: payment.id,
        orderId: payment.maib_order_id,
        refundAmount: actualRefundAmount,
        refundStatus,
        maibStatus: refundResult.result.status,
        maibStatusMessage: refundResult.result.statusMessage
      }
    })

  } catch (error) {
    console.error('Refund processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}