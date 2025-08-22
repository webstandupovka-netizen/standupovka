const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCastrPlaybackUrl() {
  try {
    console.log('🔧 Исправление Castr Playback URL...');
    
    // Получаем текущие настройки
    const { data: stream, error: fetchError } = await supabase
      .from('stream_settings')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log('📺 Текущие настройки:');
    console.log('   Stream ID:', stream.castr_stream_id);
    console.log('   Embed URL:', stream.castr_embed_url);
    console.log('   Playback URL (старый):', stream.castr_playback_url);
    
    // Создаем правильный HLS URL
    const hlsUrl = `https://fr.castr.io/${stream.castr_stream_id}.m3u8`;
    console.log('   Playback URL (новый):', hlsUrl);
    
    // Обновляем playback URL
    const { data, error } = await supabase
      .from('stream_settings')
      .update({
        castr_playback_url: hlsUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', stream.id)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log('\n✅ Playback URL успешно обновлен!');
    console.log('   Новый HLS URL:', data[0].castr_playback_url);
    
    // Проверяем доступность HLS потока
    console.log('\n🌐 Проверка доступности HLS потока...');
    try {
      const response = await fetch(hlsUrl, { method: 'HEAD' });
      console.log('   Статус HLS:', response.status === 200 ? '✅ Доступен' : `❌ Недоступен (${response.status})`);
    } catch (fetchError) {
      console.log('   Статус HLS: ❌ Ошибка подключения (возможно, стрим не активен)');
    }
    
    console.log('\n🎯 Результат:');
    console.log('   ✅ VideoPlayer теперь будет использовать правильный HLS URL');
    console.log('   📱 Страница /stream должна корректно отображать видео');
    
  } catch (error) {
    console.error('❌ Ошибка при исправлении Playback URL:', error.message);
    process.exit(1);
  }
}

fixCastrPlaybackUrl();