# Решение проблемы с зависшими платежами

## Проблема
Платежи оставались в статусе 'pending' даже после успешной оплаты через MAIB.

## Причины
1. **Неправильное маппирование статусов**: В методе `processWebhook` возвращался сырой статус MAIB ('OK') вместо внутреннего статуса приложения ('completed')
2. **Ошибки в структуре базы данных**: Webhook пытался обновить несуществующие колонки (`maib_pay_id`, `maib_rrn`, `maib_approval_code`)
3. **Проблемы с localhost webhook**: MAIB не может отправлять webhook'и на localhost URL

## Исправления

### 1. Исправлено маппирование статусов в `src/lib/payments/maib.ts`

**В методе `processWebhook`:**
```typescript
// Мапим статусы MAIB на наши внутренние статусы
let mappedStatus = 'pending'
if (result.status === 'OK' && result.statusCode === '000') {
  mappedStatus = 'completed'
} else if (result.status === 'FAILED' || result.status === 'DECLINED' || result.status === 'TIMEOUT') {
  mappedStatus = 'failed'
} else if (result.status === 'CREATED' || result.status === 'PENDING') {
  mappedStatus = 'pending'
}

return {
  // ...
  status: mappedStatus, // Возвращаем маппированный статус
  // ...
}
```

**В методе `getPaymentStatus`:**
```typescript
// Мапим статус для консистентности
let mappedStatus = 'unknown'
if (statusData.result?.status === 'OK') {
  mappedStatus = 'completed'
} else if (statusData.result?.status === 'FAILED' || statusData.result?.status === 'DECLINED' || statusData.result?.status === 'TIMEOUT') {
  mappedStatus = 'failed'
} else if (statusData.result?.status === 'CREATED' || statusData.result?.status === 'PENDING') {
  mappedStatus = 'pending'
}

return mappedStatus
```

### 2. Исправлена структура обновления в `src/app/api/payments/webhook/route.ts`

**Было:**
```typescript
.update({
  status: paymentDetails.status,
  maib_pay_id: paymentDetails.payId,        // ❌ Колонка не существует
  maib_rrn: paymentDetails.rrn,             // ❌ Колонка не существует
  maib_approval_code: paymentDetails.approvalCode, // ❌ Колонка не существует
  // ...
})
```

**Стало:**
```typescript
.update({
  status: paymentDetails.status,
  maib_transaction_id: paymentDetails.payId, // ✅ Существующая колонка
  updated_at: new Date().toISOString(),
  metadata: {
    ...paymentDetails.metadata,
    webhook_received_at: new Date().toISOString(),
    rrn: paymentDetails.rrn,                 // ✅ Сохраняем в metadata
    approval_code: paymentDetails.approvalCode // ✅ Сохраняем в metadata
  }
})
```

### 3. Добавлено подробное логирование

В webhook endpoint добавлены логи для отладки:
- Получение webhook'а
- Валидация подписи
- Обработка данных
- Обновление базы данных
- Отправка email уведомлений

## Структура таблицы payments

Существующие колонки:
```sql
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'MDL',
    status TEXT NOT NULL DEFAULT 'pending',
    maib_transaction_id TEXT,  -- ✅ Для payId
    maib_order_id TEXT UNIQUE, -- ✅ Для orderId
    payment_method TEXT,
    metadata JSONB DEFAULT '{}', -- ✅ Для дополнительных данных
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Тестирование

### Созданы тестовые скрипты:

1. **`create-test-payment.js`** - создает тестовый платеж в базе данных
2. **`test-webhook.js`** - отправляет тестовый webhook с правильной подписью

### Результат тестирования:
```
✅ Webhook processed successfully
✅ Payment updated successfully
✅ Status changed from 'pending' to 'completed'
```

## Решение проблемы с localhost

Для продакшена необходимо:
1. Установить `NEXT_PUBLIC_APP_URL` на реальный домен
2. Убедиться, что webhook URL доступен для MAIB
3. Настроить HTTPS для безопасности

## Статусы MAIB → Внутренние статусы

| MAIB Status | Status Code | Внутренний статус |
|-------------|-------------|-------------------|
| OK          | 000         | completed         |
| FAILED      | *           | failed            |
| DECLINED    | *           | failed            |
| CREATED     | *           | pending           |
| PENDING     | *           | pending           |
| *           | *           | unknown           |

## Проверка исправлений

Для проверки работы webhook'ов:

1. Запустить сервер разработки: `npm run dev`
2. Создать тестовый платеж: `node create-test-payment.js`
3. Отправить тестовый webhook: `node test-webhook.js`
4. Проверить логи сервера и статус платежа в базе данных

Все исправления протестированы и работают корректно.