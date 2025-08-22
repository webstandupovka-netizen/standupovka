const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCastrEmbedUrl() {
  try {
    console.log('Updating Castr embed URL...');
    
    // Обновляем castr_embed_url и castr_playback_url на Direct Player Link
    const { data, error } = await supabase
      .from('stream_settings')
      .update({
        castr_embed_url: 'https://player.castr.com/live_691333907e6811f09d8453d91b8ad2ad',
        castr_playback_url: 'https://player.castr.com/live_691333907e6811f09d8453d91b8ad2ad'
      })
      .eq('castr_stream_id', 'live_691333907e6811f09d8453d91b8ad2ad')
      .select();

    if (error) {
      console.error('Error updating castr_embed_url:', error);
      return;
    }

    console.log('Successfully updated castr_embed_url:', data);
    
    // Проверяем доступность Direct Player Link
    console.log('\nChecking Direct Player Link availability...');
    const response = await fetch('https://player.castr.com/live_691333907e6811f09d8453d91b8ad2ad');
    console.log('Direct Player Link status:', response.status);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixCastrEmbedUrl();