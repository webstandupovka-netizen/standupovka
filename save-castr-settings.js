const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function saveCastrSettings() {
  try {
    console.log('🔄 Сохранение настроек Castr...');
    
    // Получаем первый активный стрим
    const { data: streams, error: fetchError } = await supabase
      .from('stream_settings')
      .select('*')
      .eq('is_active', true)
      .limit(1);
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!streams || streams.length === 0) {
      console.log('❌ Активные стримы не найдены');
      return;
    }
    
    const streamId = streams[0].id;
    console.log(`📺 Обновление стрима: ${streamId}`);
    
    // Обновляем настройки Castr
    const { data, error } = await supabase
      .from('stream_settings')
      .update({
        castr_stream_id: 'live_691333907e6811f09d8453d91b8ad2ad',
        castr_embed_url: 'https://player.castr.com/live_691333907e6811f09d8453d91b8ad2ad',
        castr_rtmp_url: 'rtmp://fr.castr.io/static',
        castr_stream_key: 'live_691333907e6811f09d8453d91b8ad2ad?password=82943a02',
        castr_playback_url: 'https://player.castr.com/live_691333907e6811f09d8453d91b8ad2ad',
        updated_at: new Date().toISOString()
      })
      .eq('id', streamId)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Настройки Castr успешно сохранены:');
    console.log('   Stream ID:', data[0].castr_stream_id);
    console.log('   RTMP URL:', data[0].castr_rtmp_url);
    console.log('   Stream Key:', data[0].castr_stream_key);
    console.log('   Playback URL:', data[0].castr_playback_url);
    console.log('   Embed URL:', data[0].castr_embed_url);
    
    // Проверяем, что настройки сохранились
    const { data: verification, error: verifyError } = await supabase
      .from('stream_settings')
      .select('castr_stream_id, castr_rtmp_url, castr_stream_key, castr_playback_url, castr_embed_url')
      .eq('id', streamId)
      .single();
    
    if (verifyError) {
      throw verifyError;
    }
    
    console.log('\n🔍 Проверка сохранённых данных:');
    console.log('   ✓ Stream ID сохранён:', verification.castr_stream_id ? 'Да' : 'Нет');
    console.log('   ✓ RTMP URL сохранён:', verification.castr_rtmp_url ? 'Да' : 'Нет');
    console.log('   ✓ Stream Key сохранён:', verification.castr_stream_key ? 'Да' : 'Нет');
    console.log('   ✓ Playback URL сохранён:', verification.castr_playback_url ? 'Да' : 'Нет');
    console.log('   ✓ Embed URL сохранён:', verification.castr_embed_url ? 'Да' : 'Нет');
    
  } catch (error) {
    console.error('❌ Ошибка при сохранении настроек Castr:', error.message);
    process.exit(1);
  }
}

saveCastrSettings();