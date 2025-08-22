require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Простая функция для получения токена MAIB
async function getMAIBToken() {
  const response = await fetch('https://api.maibmerchants.md/v1/generate-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId: process.env.MAIB_PROJECT_ID,
      projectSecret: process.env.MAIB_PROJECT_SECRET
    })
  });
  
  const data = await response.json();
  return data.result?.accessToken;
}

// Функция для проверки статуса платежа в MAIB
async function checkMAIBPaymentStatus(payId) {
  try {
    const token = await getMAIBToken();
    
    const response = await fetch(`https://api.maibmerchants.md/v1/pay-info/${payId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`MAIB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('MAIB API request failed:', error.message);
    return null;
  }
}

async function checkPaymentStatus() {
  try {
    console.log('Checking payment status...');
    
    // Получаем pending платежи
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return;
    }
    
    if (payments.length === 0) {
      console.log('No pending payments found.');
      return;
    }
    
    console.log(`Found ${payments.length} pending payment(s)`);
    
    for (const payment of payments) {
      console.log(`\n=== Payment ${payment.id} ===`);
      console.log(`Order ID: ${payment.maib_order_id}`);
      console.log(`MAIB Pay ID: ${payment.maib_pay_id || 'N/A'}`);
      console.log(`Amount: ${payment.amount} ${payment.currency}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Created: ${payment.created_at}`);
      
      const timeDiff = new Date() - new Date(payment.created_at);
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      console.log(`Age: ${minutesAgo} minutes`);
      
      if (payment.maib_pay_id) {
        console.log('\nChecking with MAIB API...');
        const maibResponse = await checkMAIBPaymentStatus(payment.maib_pay_id);
        
        if (maibResponse) {
          console.log('MAIB Response:', JSON.stringify(maibResponse, null, 2));
          
          if (maibResponse.result) {
            const maibStatus = maibResponse.result.status;
            console.log(`MAIB Status: ${maibStatus}`);
            
            // Мапим статусы MAIB на наши статусы
            let newStatus = payment.status;
            if (maibStatus === 'OK') {
              newStatus = 'completed';
            } else if (maibStatus === 'FAILED' || maibStatus === 'DECLINED' || maibStatus === 'TIMEOUT') {
              newStatus = 'failed';
            } else if (maibStatus === 'CREATED' || maibStatus === 'PENDING') {
              newStatus = 'pending';
            }
            
            if (newStatus !== payment.status) {
              console.log(`\n⚠️  Status update needed: ${payment.status} → ${newStatus}`);
              
              const { error: updateError } = await supabase
                .from('payments')
                .update({
                  status: newStatus,
                  updated_at: new Date().toISOString()
                })
                .eq('id', payment.id);
              
              if (updateError) {
                console.error('❌ Failed to update:', updateError);
              } else {
                console.log('✅ Status updated successfully');
              }
            } else {
              console.log('✅ Status is current');
            }
          }
        } else {
          console.log('❌ Could not get MAIB status');
        }
      } else {
        console.log('❌ No MAIB Pay ID - payment creation may have failed');
        
        if (minutesAgo > 10) {
          console.log('⚠️  Consider marking as failed (no MAIB Pay ID after 10+ minutes)');
        }
      }
    }
    
    console.log('\n=== Объяснение статуса "pending" ===');
    console.log('Статус "pending" это нормально и означает:');
    console.log('1. 💳 Платеж создан в системе');
    console.log('2. 🔗 Пользователь получил ссылку на оплату MAIB');
    console.log('3. ⏳ Пользователь еще не завершил процесс оплаты');
    console.log('4. 🔄 Статус обновится автоматически после оплаты через webhook');
    console.log('\n✅ Это ожидаемое поведение для незавершенных платежей!');
    
  } catch (error) {
    console.error('Failed to check payment status:', error);
  }
}

checkPaymentStatus();