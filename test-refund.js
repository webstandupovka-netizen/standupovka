require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { MAIBPaymentService } = require('./src/lib/payments/maib')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testRefund() {
  try {
    console.log('🧪 Testing payment refund functionality...')
    
    // Получаем последний completed платеж
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .not('metadata->refund_status', 'eq', 'refunded')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError)
      return
    }
    
    if (!payments || payments.length === 0) {
      console.log('❌ No completed payments found for testing')
      return
    }
    
    const payment = payments[0]
    console.log('📋 Found payment for testing:')
    console.log(`   ID: ${payment.id}`)
    console.log(`   Order ID: ${payment.maib_order_id}`)
    console.log(`   MAIB Pay ID: ${payment.maib_transaction_id}`)
    console.log(`   Amount: ${payment.amount} ${payment.currency}`)
    console.log(`   Status: ${payment.status}`)
    
    if (!payment.maib_transaction_id) {
      console.log('❌ Payment does not have MAIB transaction ID')
      return
    }
    
    // Тестируем частичный возврат (50% от суммы)
    const refundAmount = Math.round(payment.amount * 0.5 * 100) / 100
    
    console.log(`\n🔄 Testing partial refund of ${refundAmount} ${payment.currency}...`)
    
    const maibService = new MAIBPaymentService()
    
    const refundResult = await maibService.refundPayment({
      payId: payment.maib_transaction_id,
      refundAmount: refundAmount
    })
    
    console.log('📊 MAIB Refund Response:', JSON.stringify(refundResult, null, 2))
    
    if (refundResult.ok && refundResult.result) {
      console.log('✅ MAIB refund successful!')
      console.log(`💰 Refunded amount: ${refundResult.result.refundAmount} ${payment.currency}`)
      console.log(`📄 Status: ${refundResult.result.status}`)
      console.log(`📝 Message: ${refundResult.result.statusMessage}`)
      
      // Обновляем платеж в базе данных
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          updated_at: new Date().toISOString(),
          metadata: {
            ...payment.metadata,
            refund_status: 'partially_refunded',
            refund_amount: refundResult.result.refundAmount,
            refund_date: new Date().toISOString(),
            test_refund: true,
            maib_refund_response: {
              payId: refundResult.result.payId,
              orderId: refundResult.result.orderId,
              status: refundResult.result.status,
              statusCode: refundResult.result.statusCode,
              statusMessage: refundResult.result.statusMessage
            }
          }
        })
        .eq('id', payment.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('❌ Failed to update payment in database:', updateError)
      } else {
        console.log('✅ Payment updated in database successfully')
        console.log('📋 Updated payment metadata:', JSON.stringify(updatedPayment.metadata, null, 2))
      }
      
    } else {
      console.log('❌ MAIB refund failed!')
      console.log('🔍 Errors:', refundResult.errors)
    }
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

// Функция для тестирования полного возврата
async function testFullRefund() {
  try {
    console.log('\n🧪 Testing full refund functionality...')
    
    // Получаем платеж с частичным возвратом
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .eq('metadata->refund_status', 'partially_refunded')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError)
      return
    }
    
    if (!payments || payments.length === 0) {
      console.log('❌ No partially refunded payments found for testing')
      return
    }
    
    const payment = payments[0]
    console.log('📋 Found partially refunded payment:')
    console.log(`   ID: ${payment.id}`)
    console.log(`   Order ID: ${payment.maib_order_id}`)
    console.log(`   Amount: ${payment.amount} ${payment.currency}`)
    console.log(`   Already refunded: ${payment.metadata.refund_amount} ${payment.currency}`)
    
    const remainingAmount = payment.amount - payment.metadata.refund_amount
    console.log(`   Remaining amount: ${remainingAmount} ${payment.currency}`)
    
    console.log('\n⚠️  Note: Full refund of partially refunded payment requires contacting MAIB support')
    console.log('📧 Contact: ecom@maib.md')
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

// Запускаем тесты
async function runTests() {
  await testRefund()
  await testFullRefund()
}

runTests()