require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runCastrMigration() {
  try {
    console.log('Starting Castr migration...');
    
    // Проверяем текущую структуру таблицы
    console.log('Checking current table structure...');
    
    const { data: currentData, error: selectError } = await supabase
      .from('stream_settings')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('Error accessing stream_settings:', selectError);
      return;
    }
    
    console.log('Current table columns:', Object.keys(currentData[0] || {}));
    
    // Проверяем, есть ли уже поля Castr
    const hascastrFields = currentData[0] && 'castr_stream_id' in currentData[0];
    
    if (hascastrFields) {
      console.log('✅ Castr fields already exist in the database');
      console.log('Migration is already complete!');
      return;
    }
    
    console.log('❌ Castr fields not found. Manual SQL execution required.');
    console.log('');
    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log('='.repeat(60));
    console.log('ALTER TABLE public.stream_settings');
    console.log('ADD COLUMN IF NOT EXISTS castr_stream_id TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_embed_url TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_rtmp_url TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_stream_key TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_playback_url TEXT;');
    console.log('='.repeat(60));
    console.log('');
    console.log('After running this SQL, restart the development server.');
    
  } catch (error) {
    console.error('Migration check failed:', error);
  }
}

runCastrMigration();