require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  try {
    const testEmail = 'test@example.com';
    console.log(`Creating test user: ${testEmail}`);
    
    // Сначала проверим, существует ли уже такой пользователь
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(user => user.email === testEmail);
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.id);
      
      // Проверим профиль
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single();
      
      if (profileError) {
        console.log('Creating missing profile...');
        const { error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: existingUser.id,
            email: testEmail,
            full_name: 'Test User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
        } else {
          console.log('✅ Profile created');
        }
      } else {
        console.log('✅ Profile exists:', profile.full_name);
      }
      
      return existingUser;
    }
    
    // Создаем нового пользователя
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
    
    // Ждем для срабатывания триггера
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Проверяем профиль
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log('Creating profile manually...');
      const { error: manualError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: testEmail,
          full_name: 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (manualError) {
        console.error('❌ Manual profile creation failed:', manualError);
      } else {
        console.log('✅ Profile created manually');
      }
    } else {
      console.log('✅ Profile created by trigger:', profile.full_name);
    }
    
    return authData.user;
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

createTestUser();