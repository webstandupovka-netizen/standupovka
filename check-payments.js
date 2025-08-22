require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPayments() {
  try {
    console.log('Checking payment statuses...');
    
    // Получаем все платежи
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return;
    }
    
    console.log(`\nTotal payments: ${payments.length}`);
    
    if (payments.length === 0) {
      console.log('No payments found.');
      return;
    }
    
    // Группируем по статусам
    const statusGroups = payments.reduce((acc, payment) => {
      if (!acc[payment.status]) {
        acc[payment.status] = [];
      }
      acc[payment.status].push(payment);
      return acc;
    }, {});
    
    console.log('\n=== Payment Status Summary ===');
    Object.keys(statusGroups).forEach(status => {
      console.log(`${status.toUpperCase()}: ${statusGroups[status].length} payments`);
    });
    
    console.log('\n=== Payment Details ===');
    payments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment.id}`);
      console.log(`   Order ID: ${payment.order_id}`);
      console.log(`   User ID: ${payment.user_id}`);
      console.log(`   Amount: ${payment.amount} ${payment.currency}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Payment ID (MAIB): ${payment.payment_id || 'N/A'}`);
      console.log(`   Created: ${payment.created_at}`);
      console.log(`   Updated: ${payment.updated_at}`);
      
      if (payment.metadata) {
        console.log(`   Metadata: ${JSON.stringify(payment.metadata, null, 2)}`);
      }
    });
    
    // Проверяем статусы pending платежей
    const pendingPayments = payments.filter(p => p.status === 'pending');
    
    if (pendingPayments.length > 0) {
      console.log('\n=== Pending Payments Analysis ===');
      console.log(`Found ${pendingPayments.length} pending payment(s)`);
      
      console.log('\nPending payments should be checked with MAIB API to update their status.');
      console.log('Possible reasons for pending status:');
      console.log('1. Payment was created but user hasn\'t completed the payment');
      console.log('2. Payment was completed but webhook hasn\'t been processed');
      console.log('3. Payment status check failed');
      
      pendingPayments.forEach(payment => {
        const timeDiff = new Date() - new Date(payment.created_at);
        const minutesAgo = Math.floor(timeDiff / (1000 * 60));
        console.log(`\n- Payment ${payment.order_id}: created ${minutesAgo} minutes ago`);
        
        if (minutesAgo > 30) {
          console.log('  ⚠️  This payment is quite old and might need manual verification');
        }
      });
    }
    
    // Проверяем completed платежи
    const completedPayments = payments.filter(p => p.status === 'completed');
    
    if (completedPayments.length > 0) {
      console.log(`\n=== Completed Payments ===`);
      console.log(`Found ${completedPayments.length} completed payment(s)`);
      
      completedPayments.forEach(payment => {
        console.log(`- ${payment.order_id}: ${payment.amount} ${payment.currency}`);
      });
    }
    
  } catch (error) {
    console.error('Failed to check payments:', error);
  }
}

checkPayments();