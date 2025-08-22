const crypto = require('crypto');

// Тестовые данные webhook от MAIB
// Используем реальный orderId из созданного платежа
const testWebhookData = {
  result: {
    orderId: 'order_1754406912896', // Реальный orderId из базы данных
    payId: 'pay_1754406912896',
    status: 'OK',
    statusCode: '000',
    statusMessage: 'Transaction approved',
    amount: 100,
    currency: 'MDL',
    rrn: '123456789012',
    approval: 'TEST123'
  }
};

// Секретный ключ для подписи
const webhookSecret = process.env.MAIB_SIGNATURE_KEY || '4fa8f893-7f39-4f13-b5c2-34e6629b84dc';

// Создаем подпись
const body = JSON.stringify(testWebhookData);
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(body)
  .digest('hex');

console.log('Testing webhook endpoint...');
console.log('Body:', body);
console.log('Signature:', signature);

// Отправляем тестовый webhook
fetch('http://localhost:3001/api/payments/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-maib-signature': signature
  },
  body: body
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});