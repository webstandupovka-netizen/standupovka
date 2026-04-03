import { NextRequest, NextResponse } from 'next/server'
import { MAIBPaymentService } from '@/lib/payments/maib'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { emailService } from '@/lib/email/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-maib-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const maibService = new MAIBPaymentService()
    const isValid = maibService.validateWebhookSignature(body, signature)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const paymentDetails = maibService.processWebhook(webhookData)

    // Idempotency: проверяем текущий статус перед обновлением
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, status, metadata')
      .eq('maib_order_id', paymentDetails.orderId)
      .single()

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Если уже обработан с тем же статусом — возвращаем OK без повторной обработки
    if (existingPayment.status === paymentDetails.status && existingPayment.metadata?.webhook_processed_at) {
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Если уже completed — не откатываем на pending/processing
    if (existingPayment.status === 'completed' && paymentDetails.status !== 'refunded') {
      return NextResponse.json({ success: true, message: 'Already completed' })
    }

    // Обновляем платёж
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: paymentDetails.status,
        maib_transaction_id: paymentDetails.payId,
        updated_at: new Date().toISOString(),
        metadata: {
          ...existingPayment.metadata,
          ...paymentDetails.metadata,
          webhook_processed_at: new Date().toISOString(),
          rrn: paymentDetails.rrn,
          approval_code: paymentDetails.approvalCode
        }
      })
      .eq('id', existingPayment.id)

    if (updateError) {
      console.error('Failed to update payment:', updateError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    // Отправляем email только при первом completed
    if (paymentDetails.status === 'completed' && existingPayment.status !== 'completed') {
      try {
        const { data: payment } = await supabaseAdmin
          .from('payments')
          .select(`*, user_profiles!inner(full_name, email)`)
          .eq('id', existingPayment.id)
          .single()

        if (payment?.user_profiles?.email) {
          // Получаем данные стрима для даты/времени
          let streamDate = ''
          let streamTime = ''
          if (payment.metadata?.stream_id) {
            const { data: stream } = await supabaseAdmin
              .from('stream_settings')
              .select('stream_start_time')
              .eq('id', payment.metadata.stream_id)
              .single()

            if (stream?.stream_start_time) {
              const d = new Date(stream.stream_start_time)
              streamDate = d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
              streamTime = d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
            }
          }

          await emailService.sendPaymentSuccessEmail({
            userEmail: payment.user_profiles.email,
            userFirstname: payment.user_profiles.full_name?.split(' ')[0] || 'Utilizator',
            streamTitle: payment.metadata?.stream_title || 'Transmisiune',
            streamDate,
            streamTime,
            amount: payment.amount,
            currency: payment.currency,
            userId: payment.user_id
          })
        }
      } catch (emailError) {
        console.error('Failed to send payment email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
