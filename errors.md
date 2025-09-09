2025-09-09T11:10:44.149Z [info] 🔧 Proxy configuration: {
  enabled: true,
  hasUrl: true,
  shouldUseProxy: 'http://fixie:IwdUbJzKgYFgCbf@ventoux.usefixie.com:80\n',
  nodeEnv: 'production',
  isVercel: true
}
2025-09-09T11:10:44.149Z [info] 🔄 Using proxy fetch with URL: http://fixie:IwdUbJzKgYFgCbf@ventoux.usefixie.com:80
2025-09-09T11:10:44.364Z [warning] Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.
2025-09-09T11:10:44.725Z [info] 🔧 MAIB Service initialized: {
  apiUrl: 'https://api.maibmerchants.md/v1',
  projectId: '9FD5BB7A...',
  projectSecret: 'SET',
  signatureKey: 'SET'
}
2025-09-09T11:10:44.725Z [info] 🔄 Creating MAIB payment for order: order_1757416244507_b42f0776
2025-09-09T11:10:44.725Z [info] 🔄 MAIB Payment Request: {
  url: 'https://api.maibmerchants.md/v1/pay',
  data: {
    amount: 150,
    currency: 'MDL',
    clientIp: '194.33.41.200',
    language: 'ru',
    description: 'Оплата за просмотр: Așa, bună seara!',
    clientName: 'webstandupovka',
    email: 'webstandupovka@gmail.com',
    orderId: 'order_1757416244507_b42f0776',
    callbackUrl: 'https://www.standupovka.live//api/payments/webhook',
    okUrl: 'https://www.standupovka.live/payment/success',
    failUrl: 'https://www.standupovka.live/buy?streamId=550e8400-e29b-41d4-a716-446655440000&error=payment_failed'
  }
}
2025-09-09T11:10:44.726Z [info] 🔑 Generating MAIB access token...
2025-09-09T11:10:44.731Z [error] Proxy fetch error: TypeError: b is not a function
    at <unknown> (.next/server/chunks/955.js:1:710)
    at g.generateAccessToken (.next/server/chunks/955.js:1:3089)
    at g.getValidAccessToken (.next/server/chunks/955.js:1:4056)
    at g.getAuthHeaders (.next/server/chunks/955.js:1:4135)
    at g.createPayment (.next/server/chunks/955.js:1:4671)
    at A (.next/server/app/api/payments/create/route.js:1:1923)
    at async k (.next/server/app/api/payments/create/route.js:1:5666)
2025-09-09T11:10:44.732Z [error] Payment creation error: TypeError: b is not a function
    at <unknown> (.next/server/chunks/955.js:1:710)
    at g.generateAccessToken (.next/server/chunks/955.js:1:3089)
    at g.getValidAccessToken (.next/server/chunks/955.js:1:4056)
    at g.getAuthHeaders (.next/server/chunks/955.js:1:4135)
    at g.createPayment (.next/server/chunks/955.js:1:4671)
    at A (.next/server/app/api/payments/create/route.js:1:1923)
    at async k (.next/server/app/api/payments/create/route.js:1:5666)