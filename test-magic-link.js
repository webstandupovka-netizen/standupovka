require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMagicLinkFlow() {
  try {
    console.log('Testing magic link authentication flow...');
    
    // Проверяем текущих пользователей
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError);
      return;
    }
    
    console.log(`Current users in auth.users: ${users.users.length}`);
    users.users.forEach(user => {
      console.log(`  - ${user.email} (${user.id}) - confirmed: ${user.email_confirmed_at ? 'yes' : 'no'}`);
    });
    
    // Проверяем профили
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log(`\nCurrent profiles in user_profiles: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.id})`);
      });
    }
    
    // Проверяем, есть ли пользователи без профилей
    const usersWithoutProfiles = users.users.filter(user => 
      !profiles.some(profile => profile.id === user.id)
    );
    
    if (usersWithoutProfiles.length > 0) {
      console.log(`\n❌ Found ${usersWithoutProfiles.length} users without profiles:`);
      
      for (const user of usersWithoutProfiles) {
        console.log(`  - ${user.email} (${user.id})`);
        
        // Создаем профиль для пользователя без профиля
        console.log(`    Creating profile for ${user.email}...`);
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error(`    ❌ Error creating profile: ${createError.message}`);
        } else {
          console.log(`    ✅ Profile created successfully`);
        }
      }
    } else {
      console.log('\n✅ All users have profiles');
    }
    
    // Проверяем триггер
    console.log('\n=== Checking trigger status ===');
    
    // Проверяем функцию
    const { data: functionExists, error: funcError } = await supabase
      .rpc('sql', {
        query: "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') as exists"
      });
    
    if (funcError) {
      console.log('Cannot check function existence via RPC');
    } else {
      console.log(`Function handle_new_user exists: ${functionExists?.[0]?.exists ? 'YES' : 'NO'}`);
    }
    
    // Проверяем триггер
    const { data: triggerExists, error: trigError } = await supabase
      .rpc('sql', {
        query: "SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') as exists"
      });
    
    if (trigError) {
      console.log('Cannot check trigger existence via RPC');
    } else {
      console.log(`Trigger on_auth_user_created exists: ${triggerExists?.[0]?.exists ? 'YES' : 'NO'}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMagicLinkFlow();