require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTriggerStatus() {
  try {
    console.log('Checking trigger and function status...');
    
    // Проверяем существование функции через SQL запрос
    const { data: functionCheck, error: funcError } = await supabase
      .rpc('sql', {
        query: `
          SELECT EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = 'handle_new_user'
          ) as function_exists;
        `
      });
    
    if (funcError) {
      console.log('Checking function via alternative method...');
      // Альтернативный способ проверки
      const { data: altCheck, error: altError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .eq('routine_name', 'handle_new_user');
      
      if (altError) {
        console.log('Cannot check function existence:', altError.message);
      } else {
        console.log(altCheck?.length > 0 ? '✅ Function handle_new_user exists' : '❌ Function handle_new_user not found');
      }
    } else {
      console.log(functionCheck?.[0]?.function_exists ? '✅ Function handle_new_user exists' : '❌ Function handle_new_user not found');
    }
    
    // Проверяем существование триггера
    const { data: triggerCheck, error: trigError } = await supabase
      .rpc('sql', {
        query: `
          SELECT EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_schema = 'auth' 
            AND trigger_name = 'on_auth_user_created'
          ) as trigger_exists;
        `
      });
    
    if (trigError) {
      console.log('Cannot check trigger existence:', trigError.message);
    } else {
      console.log(triggerCheck?.[0]?.trigger_exists ? '✅ Trigger on_auth_user_created exists' : '❌ Trigger on_auth_user_created not found');
    }
    
    // Проверяем таблицу user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (profileError) {
      console.log('❌ Error accessing user_profiles table:', profileError.message);
    } else {
      console.log('✅ user_profiles table is accessible');
    }
    
    // Проверяем количество профилей
    const { count, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('Cannot count user profiles:', countError.message);
    } else {
      console.log(`📊 Total user profiles: ${count}`);
    }
    
    console.log('\n=== Status Summary ===');
    console.log('The trigger should now automatically create user profiles when new users register.');
    console.log('Test by registering a new user in the application.');
    
  } catch (error) {
    console.error('Failed to check trigger status:', error);
  }
}

checkTriggerStatus();