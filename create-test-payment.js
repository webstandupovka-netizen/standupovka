require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestPayment() {
  try {
    console.log('Creating test payment...');
    
    // Сначала получим первого пользователя
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('No users found:', usersError);
      return;
    }
    
    const userId = users[0].id;
    const orderId = 'order_' + Date.now();
    
    // Создаем тестовый платеж
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: 100,
        currency: 'MDL',
        status: 'pending',
        maib_order_id: orderId,
        metadata: {
          stream_id: 'test-stream',
          stream_title: 'Test Stream'
        }
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return;
    }
    
    console.log('✅ Test payment created successfully:');
    console.log('Payment ID:', payment.id);
    console.log('Order ID:', payment.maib_order_id);
    console.log('Status:', payment.status);
    
    return payment.maib_order_id;
    
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  createTestPayment();
}

module.exports = { createTestPayment };