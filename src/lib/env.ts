// lib/env.ts
// Централизованная конфигурация переменных окружения

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://npxqxjrunqroavlzvdce.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHF4anJ1bnFyb2F2bHp2ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDMyNjksImV4cCI6MjA2OTg3OTI2OX0.XQfiVXttJb1ZP6-71zazAYnuf4hyuf-EQ7s9wXMr3OI',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHF4anJ1bnFyb2F2bHp2ZGNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMzI2OSwiZXhwIjoyMDY5ODc5MjY5fQ.djelKooVaM6Mdp1HvNrXz00ZVd78y98yUw6xEL-OlW4',
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || 'gErrmHP21BvW7J4oHeO0eiDzmcvIKfinf4Oc06Z6g0Lmpm3ji8niaGzj7vVZnmLa3sxe+XYDT2oxaJkiH1XhyQ=='
}

// Проверка обязательных переменных
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing required Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[MISSING]')
}