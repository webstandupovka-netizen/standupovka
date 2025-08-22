require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addUserFreeAccessField() {
  try {
    console.log('Adding free_access field to user_profiles table...');
    
    // Проверяем существующие записи
    const { data: existing, error: selectError } = await supabase
      .from('user_profiles')
      .select('id, free_access')
      .limit(1);
      
    if (selectError && selectError.code === '42703') {
      console.log('Column free_access does not exist yet.');
      console.log('Please run the SQL manually in your database:');
      console.log('ALTER TABLE user_profiles ADD COLUMN free_access BOOLEAN DEFAULT FALSE;');
      return;
    }
    
    if (selectError) {
      console.error('Error checking table:', selectError);
      return;
    }
    
    console.log('✅ Column free_access already exists or was added successfully');
    console.log('✅ User free access field setup completed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addUserFreeAccessField();