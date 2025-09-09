# Инструкция по настройке MAIB Proxy

Детальное руководство по реализации и настройке proxy для работы с MAIB API через сервис Fixie.

## Обзор

В проекте реализована система proxy для обеспечения стабильного соединения с MAIB API. Proxy используется автоматически при наличии соответствующих переменных окружения.

## 1. Установка зависимостей

### Основная зависимость
```bash
npm install https-proxy-agent@^7.0.6
```

Зависимость уже добавлена в `package.json`:
```json
{
  "dependencies": {
    "https-proxy-agent": "^7.0.6"
  }
}
```

## 2. Переменные окружения

### Обязательные переменные
```bash
# Fixie Proxy URL
FIXIE_URL=http://username:password@proxy-server:port

# MAIB API credentials
MAIB_PROJECT_ID=your_project_id
MAIB_PROJECT_SECRET=your_project_secret
MAIB_SIGNATURE_KEY=your_signature_key
```

### Пример настройки для Vercel
```bash
vercel env add FIXIE_URL
vercel env add MAIB_PROJECT_ID
vercel env add MAIB_PROJECT_SECRET
vercel env add MAIB_SIGNATURE_KEY
```

## 3. Основная реализация

### Файл: `src/lib/maib-client.ts`

#### Метод создания proxy агента
```typescript
private createProxyAgent(): HttpsProxyAgent<string> | undefined {
  const fixieUrl = process.env.FIXIE_URL;
  if (fixieUrl) {
    console.log('Using Fixie proxy for MAIB requests:', {
      proxyUrl: fixieUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'),
      timestamp: new Date().toISOString()
    });
    return new HttpsProxyAgent(fixieUrl);
  }
  return undefined;
}
```

#### Использование в HTTP запросах

**Для https.request:**
```typescript
const agent = this.createProxyAgent();
const options: https.RequestOptions = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(postData)
  },
  agent: agent // Proxy агент
};
```

**Для fetch API:**
```typescript
const agent = this.createProxyAgent();
const fetchOptions: RequestInit = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data)
};

if (agent) {
  (fetchOptions as any).agent = agent;
}
```

## 4. Интеграция в API endpoints

### Файлы с интеграцией:
- `src/app/api/payments/maib/route.ts`
- `src/app/api/payments/maib/callback/route.ts`
- `src/app/api/orders/[orderId]/payment/route.ts`

Во всех этих файлах используется `maibClient`, который автоматически применяет proxy при наличии `FIXIE_URL`.

## 5. Тестирование

### Тестовые скрипты

#### 1. Общий тест proxy соединения
```bash
node test-proxy.js
```
Файл: `test-proxy.js` - проверяет работу Fixie proxy через получение IP адреса.

#### 2. Тест MAIB API через proxy
```bash
node test-maib-proxy.js
```
Файл: `test-maib-proxy.js` - тестирует генерацию токена MAIB API с proxy и без.

#### 3. Проверка IP в продакшене
```bash
node check-production-ip.js
```
Файл: `check-production-ip.js` - проверяет IP адрес и тестирует MAIB API.

### Пример вывода тестов
```bash
🔍 Тестирование MAIB API через Fixie прокси...
📡 Прокси URL: http://***:***@proxy-server:port

1️⃣ Тестирование MAIB API без прокси...
🌐 Прямое подключение:
   Статус: 200
   Ответ: {"token": "..."}

2️⃣ Тестирование MAIB API через Fixie прокси...
🔒 Через прокси:
   Статус: 200
   Ответ: {"token": "..."}

✅ MAIB API успешно работает через Fixie прокси!
```

## 6. Логирование и мониторинг

### Логи proxy соединений
Все запросы через proxy логируются с маскированием учетных данных:
```typescript
console.log('Using Fixie proxy for MAIB requests:', {
  proxyUrl: fixieUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'),
  timestamp: new Date().toISOString()
});
```

### Логи MAIB запросов
```typescript
console.log('MAIB Payment Request:', {
  url: `${this.baseUrl}/pay`,
  hasToken: !!token,
  requestBody,
  timestamp: new Date().toISOString()
});
```

## 7. Безопасность

### Маскирование учетных данных
- URL proxy маскируется в логах: `http://***:***@proxy-server:port`
- Токены не выводятся полностью, только факт их наличия
- Чувствительные данные не попадают в логи

### Переменные окружения
- Все секретные данные хранятся в переменных окружения
- Не коммитятся в репозиторий
- Настраиваются отдельно для каждой среды

## 8. Troubleshooting

### Проблема: Proxy не используется
**Решение:** Проверьте наличие переменной `FIXIE_URL`
```bash
echo $FIXIE_URL
```

### Проблема: Ошибки соединения
**Решение:** Запустите тестовые скрипты для диагностики
```bash
node test-proxy.js
node test-maib-proxy.js
```

### Проблема: Неверный формат FIXIE_URL
**Правильный формат:**
```
http://username:password@proxy-server:port
```

### Проблема: Таймауты
**Решение:** Увеличьте таймаут в запросах:
```typescript
req.setTimeout(15000, () => {
  req.destroy();
  reject(new Error('Timeout'));
});
```

## 9. Архитектурные особенности

### Автоматическое определение
- Proxy включается автоматически при наличии `FIXIE_URL`
- Fallback на прямое соединение если proxy недоступен
- Прозрачная работа для всех API endpoints

### Совместимость
- Работает с `https.request`
- Работает с `fetch` API
- Поддерживает все методы HTTP

### Производительность
- Минимальные накладные расходы
- Переиспользование соединений
- Эффективное логирование

## 10. Развертывание

### Локальная разработка
1. Установите переменные окружения в `.env.local`
2. Запустите тесты для проверки
3. Запустите приложение: `npm run dev`

### Продакшен (Vercel)
1. Настройте переменные окружения в панели Vercel
2. Деплойте приложение
3. Проверьте логи на наличие сообщений о proxy

### Мониторинг
- Следите за логами proxy соединений
- Мониторьте успешность MAIB запросов
- Проверяйте статистику использования Fixie

---

## Заключение

Данная реализация обеспечивает надежную работу с MAIB API через Fixie proxy, включая:
- Автоматическое определение и использование proxy
- Безопасное логирование
- Comprehensive тестирование
- Простую настройку через переменные окружения

Для получения дополнительной помощи обратитесь к тестовым файлам и логам приложения.