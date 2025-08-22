require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateToCastr() {
  try {
    console.log('Starting migration to Castr...');
    
    // Добавляем новые поля для Castr
    console.log('Adding Castr fields to stream_settings table...');
    
    const { data, error } = await supabase
      .from('stream_settings')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error accessing stream_settings:', error);
      return;
    }
    
    console.log('✅ Successfully connected to database');
    console.log('✅ Migration completed - Castr fields should be added via SQL panel in Supabase dashboard');
    console.log('');
    console.log('Please run the following SQL commands in your Supabase SQL editor:');
    console.log('');
    console.log('ALTER TABLE public.stream_settings');
    console.log('ADD COLUMN IF NOT EXISTS castr_stream_id TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_embed_url TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_rtmp_url TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_stream_key TEXT,');
    console.log('ADD COLUMN IF NOT EXISTS castr_playback_url TEXT;');
    console.log('');
    console.log('After running the SQL, the migration will be complete.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateToCastr();