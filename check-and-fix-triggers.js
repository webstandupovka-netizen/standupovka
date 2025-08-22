require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndFixTriggers() {
  try {
    console.log('Checking database triggers and functions...');
    
    // Проверяем существование функции handle_new_user
    const { data: functions, error: funcError } = await supabase
      .rpc('pg_get_functiondef', { funcid: 'public.handle_new_user' })
      .single();
    
    if (funcError && funcError.code === 'PGRST202') {
      console.log('Function handle_new_user does not exist. Creating...');
      
      // Создаем функцию и триггер
      const createFunctionSQL = `
        -- Function to handle new user creation
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.user_profiles (id, email, full_name)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        -- Create trigger on auth.users
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        
        -- Grant necessary permissions
        GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
        GRANT ALL ON public.user_profiles TO supabase_auth_admin;
      `;
      
      console.log('\nExecuting SQL to create function and trigger...');
      console.log('SQL:', createFunctionSQL);
      
      // Выполняем SQL напрямую
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
      
      if (sqlError) {
        console.error('Error executing SQL:', sqlError);
        console.log('\nPlease execute this SQL manually in Supabase SQL Editor:');
        console.log('--- START SQL ---');
        console.log(createFunctionSQL);
        console.log('--- END SQL ---');
      } else {
        console.log('✅ Function and trigger created successfully!');
      }
    } else if (funcError) {
      console.error('Error checking function:', funcError);
    } else {
      console.log('✅ Function handle_new_user already exists');
    }
    
    // Проверяем существование таблицы user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error accessing user_profiles table:', profileError);
    } else {
      console.log('✅ user_profiles table is accessible');
    }
    
    // Проверяем RLS политики
    const { data: policies, error: policyError } = await supabase
      .rpc('pg_policies')
      .eq('tablename', 'user_profiles');
    
    if (policyError) {
      console.log('Could not check RLS policies:', policyError);
    } else {
      console.log('RLS policies for user_profiles:', policies?.length || 0);
    }
    
  } catch (error) {
    console.error('Failed to check triggers:', error);
  }
}

checkAndFixTriggers();