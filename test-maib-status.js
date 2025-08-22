require('dotenv').config({ path: '.env.local' });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

async function generateAccessToken() {
  const options = {
    hostname: 'api.maibmerchants.md',
    port: 443,
    path: '/v1/generate-token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const postData = JSON.stringify({
    projectId: process.env.MAIB_PROJECT_ID,
    projectSecret: process.env.MAIB_PROJECT_SECRET
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function checkPaymentStatus(accessToken, paymentId) {
  const options = {
    hostname: 'api.maibmerchants.md',
    port: 443,
    path: `/v1/pay-info/${paymentId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function testMAIBStatus() {
  try {
    console.log('🔍 Testing MAIB status check...');
    
    // Сначала получаем access token
    console.log('🔑 Generating access token...');
    const tokenResponse = await generateAccessToken();
    console.log('🔑 Token response status:', tokenResponse.statusCode);
    console.log('🔑 Token response data:', tokenResponse.data);
    
    if (tokenResponse.statusCode !== 200) {
      console.error('❌ Failed to generate token');
      return;
    }
    
    const tokenData = JSON.parse(tokenResponse.data);
    if (!tokenData.ok || !tokenData.result) {
      console.error('❌ Token generation failed:', tokenData.errors);
      return;
    }
    
    const accessToken = tokenData.result.accessToken;
    console.log('✅ Access token generated successfully');
    
    // Теперь проверяем статус платежа
    const paymentId = '56e45e1d-4edb-4154-a523-99985df49527';
    console.log('📞 Calling MAIB API for payment:', paymentId);
    
    const statusResponse = await checkPaymentStatus(accessToken, paymentId);
    console.log('📊 MAIB status response status:', statusResponse.statusCode);
    console.log('📊 MAIB status response data:', statusResponse.data);
    
    // Также проверим базу данных
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('maib_transaction_id', paymentId)
      .single();
    
    if (error) {
      console.error('❌ Database error:', error);
    } else {
      console.log('💾 Current payment in DB:', JSON.stringify(payment, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMAIBStatus();