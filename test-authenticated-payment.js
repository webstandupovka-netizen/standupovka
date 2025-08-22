// Этот скрипт нужно запустить ПОСЛЕ авторизации через magic link
// Он покажет, как тестировать API с правильными cookie

const testPaymentWithAuth = async () => {
  console.log('🧪 Testing authenticated payment creation...');
  console.log('📝 Instructions:');
  console.log('1. First, open the magic link in browser to authenticate');
  console.log('2. Then open browser dev tools (F12)');
  console.log('3. Go to Application/Storage tab -> Cookies -> localhost:3002');
  console.log('4. Copy the values of sb-access-token and sb-refresh-token');
  console.log('5. Update this script with those values');
  console.log('6. Run this script again');
  console.log('');
  
  // REPLACE THESE WITH ACTUAL COOKIE VALUES FROM BROWSER
  const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
  const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN_HERE';
  
  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    console.log('❌ Please update ACCESS_TOKEN and REFRESH_TOKEN in this script first');
    console.log('\n🔗 Magic link from previous test:');
    console.log('https://npxqxjrunqroavlzvdce.supabase.co/auth/v1/verify?token=b3beac737cefbfa6066759e2f8711c505800defce67684e0a0841aea&type=magiclink&redirect_to=http://localhost:3002/auth/callback');
    return;
  }
  
  try {
    const paymentData = {
      streamId: '550e8400-e29b-41d4-a716-446655440000'
    };
    
    console.log('🚀 Making authenticated request...');
    
    const response = await fetch('http://localhost:3002/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${ACCESS_TOKEN}; sb-refresh-token=${REFRESH_TOKEN}`
      },
      body: JSON.stringify(paymentData)
    });
    
    const responseText = await response.text();
    
    console.log('\n📋 Response Status:', response.status);
    console.log('📋 Response Body:', responseText);
    
    if (response.ok) {
      console.log('\n✅ Payment creation successful!');
      try {
        const data = JSON.parse(responseText);
        if (data.paymentUrl) {
          console.log('💳 Payment URL:', data.paymentUrl);
        }
      } catch (e) {
        // Response might not be JSON
      }
    } else {
      console.log('\n❌ Payment creation failed');
      if (response.status === 401) {
        console.log('🔐 Authentication failed - check your tokens');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testPaymentWithAuth();

// Alternative: Test with curl command
console.log('\n🔧 Alternative: Test with curl command:');
console.log('curl -X POST http://localhost:3002/api/payments/create \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Cookie: sb-access-token=YOUR_ACCESS_TOKEN; sb-refresh-token=YOUR_REFRESH_TOKEN" \\');
console.log('  -d \'{"streamId":"550e8400-e29b-41d4-a716-446655440000"}\'');