require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserCreation() {
  try {
    console.log('Testing user creation and profile trigger...');
    
    // Создаем тестового пользователя
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`Creating test user: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    });
    
    if (authError) {
      console.error('Error creating user:', authError);
      return;
    }
    
    console.log('✅ User created successfully:', authData.user.id);
    
    // Ждем немного для срабатывания триггера
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Проверяем, создался ли профиль
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile not found:', profileError);
      
      // Попытаемся создать профиль вручную
      console.log('Attempting to create profile manually...');
      const { data: manualProfile, error: manualError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: testEmail,
          full_name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (manualError) {
        console.error('❌ Manual profile creation failed:', manualError);
      } else {
        console.log('✅ Profile created manually:', manualProfile);
      }
    } else {
      console.log('✅ Profile created automatically by trigger:', profile);
    }
    
    // Проверяем все профили
    const { data: allProfiles, error: allError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (allError) {
      console.error('Error fetching all profiles:', allError);
    } else {
      console.log(`📊 Total profiles in database: ${allProfiles.length}`);
      allProfiles.forEach(p => {
        console.log(`  - ${p.email} (${p.id})`);
      });
    }
    
    // Удаляем тестового пользователя
    console.log('\nCleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteError) {
      console.error('Error deleting test user:', deleteError);
    } else {
      console.log('✅ Test user deleted');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUserCreation();