import { NextRequest, NextResponse } from 'next/server'
import { MAIBPaymentService } from '@/lib/payments/maib'
import { supabaseServer } from '@/lib/database/client'
import { emailService } from '@/lib/email/service'

export async function POST(request: NextRequest) {
  try {
    console.log('=== MAIB Webhook received ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.text()
    console.log('Body:', body);
    
    const signature = request.headers.get('x-maib-signature')
    console.log('Signature:', signature);

    if (!signature) {
      console.log('❌ Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const maibService = new MAIBPaymentService()
    
    // Проверяем подпись webhook
    const isValid = maibService.validateWebhookSignature(body, signature)
    console.log('Signature valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Парсим данные webhook
    const webhookData = JSON.parse(body)
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2));
    
    const paymentDetails = maibService.processWebhook(webhookData)
    console.log('Processed payment details:', JSON.stringify(paymentDetails, null, 2));

    // Обновляем статус платежа в базе данных
    console.log(`Updating payment with orderId: ${paymentDetails.orderId} to status: ${paymentDetails.status}`);
    
    const { data: updatedPayment, error: updateError } = await supabaseServer
      .from('payments')
      .update({
        status: paymentDetails.status,
        maib_transaction_id: paymentDetails.payId,
        updated_at: new Date().toISOString(),
        metadata: {
          ...paymentDetails.metadata,
          webhook_received_at: new Date().toISOString(),
          rrn: paymentDetails.rrn,
          approval_code: paymentDetails.approvalCode
        }
      })
      .eq('maib_order_id', paymentDetails.orderId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update payment:', updateError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }
    
    console.log('✅ Payment updated successfully:', updatedPayment);

    // Если платеж успешен, отправляем email уведомление
    if (paymentDetails.status === 'completed') {
      try {
        // Получаем информацию о платеже и пользователе
        const { data: payment } = await supabaseServer
          .from('payments')
          .select(`
            *,
            user_profiles!inner(full_name, email)
          `)
          .eq('maib_order_id', paymentDetails.orderId)
          .single()

        if (payment && payment.user_profiles.email) {
          const userFirstname = payment.user_profiles.full_name?.split(' ')[0] || 'Пользователь'
          
          // Отправляем email уведомление
          console.log(`📧 Sending payment success email to: ${payment.user_profiles.email}`);
          
          await emailService.sendPaymentSuccessEmail({
            userEmail: payment.user_profiles.email,
            userFirstname,
            streamTitle: payment.metadata?.stream_title || 'Стендап Вечер',
            streamDate: '21 сентября 2025',
            streamTime: '20:00',
            amount: payment.amount,
            currency: payment.currency,
            userId: payment.user_id
          })
          
          console.log(`✅ Payment completed and email sent for order: ${paymentDetails.orderId}`)
        }
      } catch (emailError) {
        console.error('❌ Failed to send payment success email:', emailError)
        // Не прерываем обработку webhook из-за ошибки email
      }
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}