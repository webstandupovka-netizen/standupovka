require('dotenv').config({ path: '.env.local' })
const { MAIBPaymentService } = require('./src/lib/payments/maib')

async function testMAIBDirectly() {
  try {
    console.log('🧪 Testing MAIB payment creation directly...')
    
    const maibService = new MAIBPaymentService()
    
    const testPaymentData = {
      amount: 150,
      currency: 'MDL',
      clientIp: '127.0.0.1',
      language: 'ru',
      description: 'Тестовый платеж для отладки',
      clientName: 'Test User',
      email: 'test@example.com',
      phone: '+37369123456',
      orderId: `test_order_${Date.now()}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      okUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`
    }
    
    console.log('📋 Payment data:', JSON.stringify(testPaymentData, null, 2))
    console.log('🔄 Creating payment in MAIB...')
    
    const result = await maibService.createPayment(testPaymentData)
    
    console.log('📊 MAIB Response:', JSON.stringify(result, null, 2))
    
    if (result.ok && result.result) {
      console.log('✅ MAIB payment created successfully!')
      console.log('💳 Pay URL:', result.result.payUrl)
      console.log('🆔 Pay ID:', result.result.payId)
    } else {
      console.log('❌ MAIB payment creation failed!')
      console.log('🔍 Errors:', result.errors)
    }
    
  } catch (error) {
    console.error('💥 Test error:', error)
  }
}

testMAIBDirectly()