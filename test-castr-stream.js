const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCastrStream() {
  try {
    console.log('🧪 Тестирование настроек Castr стрима...');
    
    // Получаем настройки стрима
    const { data: stream, error } = await supabase
      .from('stream_settings')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('\n📺 Информация о стриме:');
    console.log('   ID:', stream.id);
    console.log('   Название:', stream.title);
    console.log('   Статус:', stream.is_live ? '🔴 В эфире' : '⚫ Не в эфире');
    console.log('   Активен:', stream.is_active ? '✅ Да' : '❌ Нет');
    
    console.log('\n🎥 Настройки Castr:');
    console.log('   Stream ID:', stream.castr_stream_id || '❌ Не установлен');
    console.log('   RTMP URL:', stream.castr_rtmp_url || '❌ Не установлен');
    console.log('   Stream Key:', stream.castr_stream_key ? '✅ Установлен' : '❌ Не установлен');
    console.log('   Playback URL:', stream.castr_playback_url || '❌ Не установлен');
    console.log('   Embed URL:', stream.castr_embed_url || '❌ Не установлен');
    
    // Проверяем доступность плеера
    console.log('\n🌐 Проверка доступности плеера...');
    if (stream.castr_playback_url) {
      try {
        const response = await fetch(stream.castr_playback_url, { method: 'HEAD' });
        console.log('   Статус плеера:', response.status === 200 ? '✅ Доступен' : `❌ Недоступен (${response.status})`);
      } catch (fetchError) {
        console.log('   Статус плеера: ❌ Ошибка подключения');
      }
    } else {
      console.log('   Статус плеера: ❌ URL не установлен');
    }
    
    // Проверяем полноту настроек
    console.log('\n✅ Проверка полноты настроек:');
    const requiredFields = [
      { field: 'castr_stream_id', name: 'Stream ID' },
      { field: 'castr_rtmp_url', name: 'RTMP URL' },
      { field: 'castr_stream_key', name: 'Stream Key' },
      { field: 'castr_playback_url', name: 'Playback URL' },
      { field: 'castr_embed_url', name: 'Embed URL' }
    ];
    
    let allFieldsSet = true;
    requiredFields.forEach(({ field, name }) => {
      const isSet = stream[field] && stream[field].trim() !== '';
      console.log(`   ${name}: ${isSet ? '✅' : '❌'}`);
      if (!isSet) allFieldsSet = false;
    });
    
    console.log('\n🎯 Результат:');
    if (allFieldsSet) {
      console.log('   ✅ Все настройки Castr корректно установлены!');
      console.log('   🚀 Стрим готов к использованию');
      
      console.log('\n📋 Инструкции для стриминга:');
      console.log('   1. Используйте RTMP URL:', stream.castr_rtmp_url);
      console.log('   2. Используйте Stream Key:', stream.castr_stream_key);
      console.log('   3. Плеер будет доступен по адресу:', stream.castr_playback_url);
    } else {
      console.log('   ❌ Некоторые настройки отсутствуют');
      console.log('   🔧 Проверьте админскую панель');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании стрима:', error.message);
    process.exit(1);
  }
}

testCastrStream();