const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updatePaymentStatus() {
  try {
    console.log('🔍 Looking for payment with processing status...')
    
    // Найти платеж со статусом processing
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('maib_transaction_id', '56e45e1d-4edb-4154-a523-99985df49527')
      .single()

    if (paymentError || !payment) {
      console.error('❌ Payment not found:', paymentError)
      return
    }

    console.log('💾 Current payment status:', payment.status)
    
    if (payment.status === 'processing') {
      console.log('🔄 Updating payment status to completed...')
      
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('❌ Failed to update payment status:', updateError)
      } else {
        console.log('✅ Payment status updated to completed')
        
        // Проверить обновленный статус
        const { data: updatedPayment } = await supabase
          .from('payments')
          .select('status, updated_at')
          .eq('id', payment.id)
          .single()
          
        console.log('📊 Updated payment status:', updatedPayment.status)
        console.log('📅 Updated at:', updatedPayment.updated_at)
      }
    } else {
      console.log('ℹ️ Payment status is already:', payment.status)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

updatePaymentStatus()