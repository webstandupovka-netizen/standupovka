require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeCastrMigration() {
  try {
    console.log('Executing Castr migration...');
    
    // Выполняем миграцию через SQL запрос
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE public.stream_settings
        ADD COLUMN IF NOT EXISTS castr_stream_id TEXT,
        ADD COLUMN IF NOT EXISTS castr_embed_url TEXT,
        ADD COLUMN IF NOT EXISTS castr_rtmp_url TEXT,
        ADD COLUMN IF NOT EXISTS castr_stream_key TEXT,
        ADD COLUMN IF NOT EXISTS castr_playback_url TEXT;
      `
    });
    
    if (error) {
      console.error('Migration error:', error);
      console.log('\nTrying alternative approach...');
      
      // Альтернативный подход - попробуем через обычный SQL
      const { error: altError } = await supabase
        .from('stream_settings')
        .select('castr_stream_id')
        .limit(1);
      
      if (altError && altError.code === 'PGRST116') {
        console.log('✅ Confirmed: Castr fields do not exist yet');
        console.log('\nPlease run the following SQL manually in Supabase Dashboard:');
        console.log('=' .repeat(70));
        console.log('ALTER TABLE public.stream_settings');
        console.log('ADD COLUMN IF NOT EXISTS castr_stream_id TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS castr_embed_url TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS castr_rtmp_url TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS castr_stream_key TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS castr_playback_url TEXT;');
        console.log('=' .repeat(70));
      } else {
        console.log('✅ Castr fields already exist!');
      }
    } else {
      console.log('✅ Migration executed successfully!');
    }
    
    // Проверяем результат
    console.log('\nVerifying migration...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('stream_settings')
      .select('*')
      .limit(1);
    
    if (verifyData && verifyData[0]) {
      const columns = Object.keys(verifyData[0]);
      const castrColumns = columns.filter(col => col.startsWith('castr_'));
      
      console.log('Current Castr columns:', castrColumns);
      
      if (castrColumns.length === 5) {
        console.log('✅ All Castr fields are present!');
        console.log('Migration completed successfully!');
      } else {
        console.log('❌ Some Castr fields are missing');
      }
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

executeCastrMigration();