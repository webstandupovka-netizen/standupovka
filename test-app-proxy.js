// Тест прокси в продакшн режиме
const nodeFetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');

// Устанавливаем переменные окружения как в продакшене
process.env.FIXIE_URL = 'http://fixie:IwdUbJzKgYFgCbf@ventoux.usefixie.com:80';
process.env.NODE_ENV = 'production';

// Симулируем логику из config.ts
const getProxyConfig = () => {
  const fixieUrl = process.env.FIXIE_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    url: fixieUrl,
    enabled: isProduction && !!fixieUrl
  };
};

// Симулируем createProxyFetch из http-agent.ts (обновленная версия)
const createProxyFetch = (proxyConfig) => {
  const shouldUseProxy = proxyConfig?.enabled && proxyConfig?.url;
  
  if (!shouldUseProxy) {
    console.log('🔄 Прокси отключен, используется стандартный fetch');
    return nodeFetch;
  }
  
  console.log('🔄 Прокси включен:', proxyConfig.url);
  
  // Для Node.js окружения (серверная сторона)
  if (typeof window === 'undefined') {
    try {
      // Определяем тип агента на основе URL прокси
      const proxyUrl = new URL(proxyConfig.url);
      const agent = proxyUrl.protocol === 'https:' 
        ? new HttpsProxyAgent(proxyConfig.url)
        : new HttpProxyAgent(proxyConfig.url);
      
      return async (url, init = {}) => {
        const options = {
          ...init,
          agent: agent
        };
        
        return nodeFetch(url, options);
      };
    } catch (error) {
      console.warn('Proxy agents not available, falling back to node-fetch');
      return nodeFetch;
    }
  }
  
  return nodeFetch;
};

async function testProductionProxy() {
  console.log('🚀 Тестирование прокси в продакшн режиме...');
  console.log('FIXIE_URL:', process.env.FIXIE_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  const proxyConfig = getProxyConfig();
  console.log('Конфигурация прокси:', proxyConfig);
  
  const proxyFetch = createProxyFetch(proxyConfig);
  
  let ipData = null;
  
  try {
    // Тест 1: Проверка IP через прокси
    console.log('\n1️⃣ Проверка IP через прокси...');
    
    console.log('Отправляем запрос через прокси к ipify.org...');
    const ipResponse = await proxyFetch('http://api.ipify.org?format=json', {
      headers: {
        'User-Agent': 'StandUp-Production-Test/1.0'
      }
    });
    
    console.log('Статус ответа:', ipResponse.status);
    if (ipResponse.ok) {
      ipData = await ipResponse.json();
      console.log('IP через прокси:', ipData.ip);
      
      // Проверяем статические IP Fixie
      const fixieIPs = ['54.217.142.99', '54.195.3.54'];
      const isFixieIP = fixieIPs.includes(ipData.ip);
      
      if (isFixieIP) {
        console.log('🎉 Отлично! Используется статический IP Fixie');
      } else {
        console.log('⚠️ IP не соответствует ожидаемым IP Fixie');
        console.log('Возможные причины:');
        console.log('- Fixie использует другие IP адреса');
        console.log('- Прокси не работает корректно');
        console.log('- Сетевые настройки');
      }
    } else {
      console.log('❌ Ошибка при получении IP:', ipResponse.status);
      const errorText = await ipResponse.text();
      console.log('Текст ошибки:', errorText);
    }
    
    // Тест 2: Проверка подключения к MAIB API
    console.log('\n2️⃣ Проверка подключения к MAIB API...');
    
    const maibResponse = await proxyFetch('https://api.maibmerchants.md/v1/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StandUp-Production-Test/1.0'
      },
      body: JSON.stringify({
        projectId: 'test-project',
        projectSecret: 'test-secret'
      })
    });
    
    console.log('MAIB API статус:', maibResponse.status, maibResponse.statusText);
    
    if (maibResponse.status === 401 || maibResponse.status === 400) {
      console.log('✅ MAIB API доступен через прокси (ошибка аутентификации ожидаема)');
    } else if (maibResponse.status === 200) {
      console.log('✅ MAIB API успешно доступен через прокси');
    } else {
      console.log('⚠️ Неожиданный статус от MAIB API:', maibResponse.status);
    }
    
    // Тест 3: Сравнение с прямым подключением
    console.log('\n3️⃣ Сравнение с прямым подключением...');
    
    const directResponse = await nodeFetch('http://api.ipify.org?format=json', {
      headers: {
        'User-Agent': 'StandUp-Direct-Test/1.0'
      }
    });
    
    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('IP без прокси:', directData.ip);
      
      if (ipData && directData.ip !== ipData.ip) {
        console.log('✅ Прокси работает - IP адреса отличаются');
        console.log('Прокси IP:', ipData.ip, 'vs Прямой IP:', directData.ip);
      } else {
        console.log('⚠️ IP адреса одинаковые - возможно прокси не используется');
      }
    }
    
    console.log('\n🎉 Тестирование завершено!');
     console.log('\n📋 Резюме:');
     console.log('- Прокси настроен:', proxyConfig.enabled ? '✅' : '❌');
     console.log('- MAIB API доступен:', maibResponse.ok || [400, 401].includes(maibResponse.status) ? '✅' : '❌');
     
     const fixieIPs = ['54.217.142.99', '54.195.3.54'];
     const hasFixieIP = ipData && fixieIPs.includes(ipData.ip);
     console.log('- Статический IP:', hasFixieIP ? '✅' : '⚠️');
     
     if (ipData) {
       console.log('\n🔍 Детали подключения:');
       console.log('- Текущий IP:', ipData.ip);
       console.log('- Ожидаемые IP Fixie:', fixieIPs.join(', '));
       
       if (!hasFixieIP) {
         console.log('\n⚠️ Внимание: IP не соответствует ожидаемым статическим IP Fixie');
         console.log('Это может означать:');
         console.log('1. Fixie использует другие IP адреса (нормально)');
         console.log('2. Прокси работает, но через другой сервер');
         console.log('3. Нужно проверить настройки Fixie в панели управления');
       }
     }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.error('Детали:', error.code || 'Неизвестная ошибка');
    process.exit(1);
  }
}

// Запуск тестов
testProductionProxy();