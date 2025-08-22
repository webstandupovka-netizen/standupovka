require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCastrConnection() {
  try {
    console.log('🔍 Тестирование подключения к Castr...');
    
    // 1. Проверяем структуру таблицы
    console.log('\n1. Проверка структуры таблицы stream_settings:');
    const { data: streamData, error: streamError } = await supabase
      .from('stream_settings')
      .select('*')
      .limit(1);
    
    if (streamError) {
      console.error('❌ Ошибка доступа к таблице:', streamError);
      return;
    }
    
    if (streamData && streamData[0]) {
      const columns = Object.keys(streamData[0]);
      const castrColumns = columns.filter(col => col.startsWith('castr_'));
      
      console.log('✅ Найденные поля Castr:', castrColumns);
      console.log('✅ Всего полей Castr:', castrColumns.length);
      
      if (castrColumns.length === 5) {
        console.log('✅ Все необходимые поля Castr присутствуют!');
      } else {
        console.log('❌ Не хватает полей Castr');
      }
    }
    
    // 2. Тестируем запись данных Castr
    console.log('\n2. Тестирование записи данных Castr:');
    const testData = {
      castr_stream_id: 'test-stream-id',
      castr_embed_url: 'https://fr.castr.io/static/test-stream-id',
      castr_rtmp_url: 'rtmp://fr.castr.io/static',
      castr_stream_key: 'test-stream-key',
      castr_playback_url: 'https://fr.castr.io/static/test-stream-id.m3u8'
    };
    
    const { data: updateData, error: updateError } = await supabase
      .from('stream_settings')
      .update(testData)
      .eq('id', '550e8400-e29b-41d4-a716-446655440000')
      .select();
    
    if (updateError) {
      console.error('❌ Ошибка обновления данных:', updateError);
    } else {
      console.log('✅ Данные Castr успешно обновлены');
      console.log('✅ Обновленные поля:', Object.keys(testData));
    }
    
    // 3. Проверяем чтение данных
    console.log('\n3. Проверка чтения данных Castr:');
    const { data: readData, error: readError } = await supabase
      .from('stream_settings')
      .select('castr_stream_id, castr_embed_url, castr_rtmp_url, castr_stream_key, castr_playback_url')
      .eq('id', '550e8400-e29b-41d4-a716-446655440000')
      .single();
    
    if (readError) {
      console.error('❌ Ошибка чтения данных:', readError);
    } else {
      console.log('✅ Данные Castr успешно прочитаны:');
      console.log(JSON.stringify(readData, null, 2));
    }
    
    // 4. Тестируем API эндпоинт
    console.log('\n4. Тестирование API эндпоинта:');
    try {
      const response = await fetch('http://localhost:3000/api/stream/550e8400-e29b-41d4-a716-446655440000');
      if (response.ok) {
        const apiData = await response.json();
        const hasCastrFields = Object.keys(apiData).some(key => key.startsWith('castr_'));
        
        if (hasCastrFields) {
          console.log('✅ API возвращает поля Castr');
          console.log('✅ Castr поля в API:', Object.keys(apiData).filter(key => key.startsWith('castr_')));
        } else {
          console.log('❌ API не возвращает поля Castr');
        }
      } else {
        console.log('❌ API недоступен (возможно, сервер не запущен)');
      }
    } catch (apiError) {
      console.log('❌ Ошибка подключения к API:', apiError.message);
    }
    
    console.log('\n🎉 Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

testCastrConnection();