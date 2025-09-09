const { HttpsProxyAgent } = require('https-proxy-agent');

// Конфигурация прокси Fixie
const FIXIE_URL = process.env.FIXIE_URL || 'http://fixie:IwdUbJzKgYFgCbf@ventoux.usefixie.com:80';

async function testProxyConnection() {
  console.log('🔍 Проверка работы прокси Fixie...');
  console.log('Прокси URL:', FIXIE_URL);
  console.log('Node.js версия:', process.version);
  
  // Проверяем наличие переменной окружения
  if (process.env.FIXIE_URL) {
    console.log('✅ FIXIE_URL найден в переменных окружения');
  } else {
    console.log('⚠️ FIXIE_URL не найден в переменных окружения, используется значение по умолчанию');
  }
  
  const agent = new HttpsProxyAgent(FIXIE_URL);
  console.log('✅ HttpsProxyAgent создан успешно');
  
  try {
    // Тест 1: Простая проверка подключения к httpbin
    console.log('\n1️⃣ Тестирование подключения через прокси к httpbin.org...');
    
    const response = await fetch('https://httpbin.org/ip', {
      agent,
      headers: {
        'User-Agent': 'StandUp-App-Test/1.0'
      },
      timeout: 15000
    });
    
    console.log('Статус ответа:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ IP через прокси:', data.origin);
      
      // Проверяем, что это статический IP Fixie
      const fixieIPs = ['54.217.142.99', '54.195.3.54'];
      if (fixieIPs.includes(data.origin)) {
        console.log('🎉 Отлично! Используется статический IP Fixie');
      } else {
        console.log('⚠️ IP не соответствует известным IP Fixie');
      }
    } else {
      console.log('❌ Ошибка HTTP:', response.status);
    }
    
    // Тест 2: Проверка прямого подключения для сравнения
    console.log('\n2️⃣ Тестирование прямого подключения (без прокси)...');
    
    const directResponse = await fetch('https://httpbin.org/ip', {
      headers: {
        'User-Agent': 'StandUp-App-Test/1.0'
      },
      timeout: 10000
    });
    
    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('Прямой IP:', directData.origin);
    } else {
      console.log('⚠️ Ошибка при прямом подключении');
    }
    
    // Тест 3: Проверка MAIB API
    console.log('\n3️⃣ Тестирование подключения к MAIB API через прокси...');
    
    const maibResponse = await fetch('https://api.maibmerchants.md/v1/generate-token', {
      method: 'POST',
      agent,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StandUp-App-Test/1.0'
      },
      body: JSON.stringify({
        projectId: 'test',
        projectSecret: 'test'
      }),
      timeout: 15000
    });
    
    console.log('MAIB API статус:', maibResponse.status, maibResponse.statusText);
    
    if (maibResponse.status === 401 || maibResponse.status === 400) {
      console.log('✅ MAIB API доступен через прокси (ошибка аутентификации ожидаема)');
    } else if (maibResponse.status === 200) {
      console.log('✅ MAIB API доступен через прокси');
    } else {
      console.log('⚠️ Неожиданный статус от MAIB API:', maibResponse.status);
    }
    
    console.log('\n🎉 Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.error('Детали ошибки:', error.code || 'Неизвестная ошибка');
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Возможно, проблема с DNS или сетевым подключением');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Возможно, прокси сервер недоступен');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Превышено время ожидания подключения');
    }
    
    process.exit(1);
  }
}

// Запуск тестов
console.log('🚀 Запуск тестирования прокси...');
testProxyConnection();