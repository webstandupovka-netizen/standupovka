// Отладочный тест для проверки различных способов подключения к Fixie
const { HttpsProxyAgent } = require('https-proxy-agent');
const http = require('http');
const https = require('https');

const FIXIE_URL = 'http://fixie:IwdUbJzKgYFgCbf@ventoux.usefixie.com:80';

async function testDifferentMethods() {
  console.log('🔍 Отладка подключения к Fixie...');
  console.log('Proxy URL:', FIXIE_URL);
  
  // Метод 1: HttpsProxyAgent с fetch (как в нашем коде)
  console.log('\n1️⃣ Тест HttpsProxyAgent с fetch...');
  try {
    const agent = new HttpsProxyAgent(FIXIE_URL);
    
    const response = await fetch('https://httpbin.org/ip', {
      agent: agent,
      headers: {
        'User-Agent': 'Node-Fetch-Test/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ HttpsProxyAgent + fetch:', data.origin);
    } else {
      console.log('❌ HttpsProxyAgent + fetch failed:', response.status);
    }
  } catch (error) {
    console.log('❌ HttpsProxyAgent + fetch error:', error.message);
  }
  
  // Метод 2: HttpsProxyAgent с https модулем
  console.log('\n2️⃣ Тест HttpsProxyAgent с https модулем...');
  try {
    const agent = new HttpsProxyAgent(FIXIE_URL);
    
    const options = {
      hostname: 'httpbin.org',
      port: 443,
      path: '/ip',
      method: 'GET',
      agent: agent,
      headers: {
        'User-Agent': 'Node-HTTPS-Test/1.0'
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.end();
    });
    
    console.log('✅ HttpsProxyAgent + https:', response.origin);
  } catch (error) {
    console.log('❌ HttpsProxyAgent + https error:', error.message);
  }
  
  // Метод 3: Проверка без прокси для сравнения
  console.log('\n3️⃣ Тест без прокси...');
  try {
    const response = await fetch('https://httpbin.org/ip', {
      headers: {
        'User-Agent': 'Direct-Test/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Прямое подключение:', data.origin);
    }
  } catch (error) {
    console.log('❌ Прямое подключение error:', error.message);
  }
  
  // Метод 4: Проверка настроек прокси
  console.log('\n4️⃣ Анализ настроек прокси...');
  try {
    const agent = new HttpsProxyAgent(FIXIE_URL);
    console.log('Agent создан успешно');
    console.log('Agent options:', {
      protocol: agent.protocol,
      host: agent.proxy?.host,
      port: agent.proxy?.port,
      auth: agent.proxy?.auth ? '[СКРЫТО]' : 'нет'
    });
  } catch (error) {
    console.log('❌ Ошибка создания агента:', error.message);
  }
  
  console.log('\n🎉 Отладка завершена!');
}

// Запуск тестов
testDifferentMethods().catch(console.error);