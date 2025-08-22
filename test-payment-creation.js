require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPaymentCreation() {
  try {
    console.log('Testing payment creation...');
    
    // Получаем тестового пользователя
    const testEmail = 'test@example.com';
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users.users.find(user => user.email === testEmail);
    
    if (!testUser) {
      console.error('❌ Test user not found');
      return;
    }
    
    console.log('✅ Test user found:', testUser.id);
    
    // Проверяем, есть ли активный стрим
    const { data: streams, error: streamError } = await supabase
      .from('stream_settings')
      .select('*')
      .eq('is_active', true);
    
    if (streamError) {
      console.error('❌ Error fetching streams:', streamError);
      return;
    }
    
    if (!streams || streams.length === 0) {
      console.log('⚠️ No active streams found, creating one...');
      
      const { data: newStream, error: createStreamError } = await supabase
        .from('stream_settings')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Test Stream',
          description: 'Test stream for payment testing',
          price: 10.00,
          is_active: true,
          stream_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createStreamError) {
        console.error('❌ Error creating stream:', createStreamError);
        return;
      }
      
      console.log('✅ Test stream created');
    } else {
      console.log('✅ Active stream found:', streams[0].title);
    }
    
    // Генерируем magic link для авторизации
    console.log('\n🔗 Generating magic link for authentication...');
    
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail,
      options: {
        redirectTo: 'http://localhost:3002/auth/callback'
      }
    });
    
    if (linkError) {
      console.error('❌ Error generating magic link:', linkError);
      return;
    }
    
    console.log('✅ Magic link generated');
    console.log('🔗 Magic link URL:', linkData.properties.action_link);
    
    // Извлекаем токены из magic link
    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');
    
    console.log('\n🧪 Testing payment creation API without authentication...');
    console.log('(This should fail with 401 to confirm auth is working)');
    
    const paymentData = {
      streamId: '550e8400-e29b-41d4-a716-446655440000'
    };
    
    // Тест без авторизации (должен вернуть 401)
    const responseUnauth = await fetch('http://localhost:3002/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    
    const responseUnAuthText = await responseUnauth.text();
    console.log('\n📋 Unauthorized test - Status:', responseUnauth.status);
    console.log('📋 Unauthorized test - Body:', responseUnAuthText);
    
    if (responseUnauth.status === 401) {
      console.log('✅ Authentication is properly enforced');
    } else {
      console.log('⚠️ Expected 401 but got', responseUnauth.status);
    }
    
    console.log('\n📝 To test with authentication:');
    console.log('1. Open the magic link in browser:', linkData.properties.action_link);
    console.log('2. After successful login, manually test the payment API');
    console.log('3. Or use browser dev tools to copy session cookies');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymentCreation();