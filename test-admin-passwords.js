require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPasswords() {
  try {
    // Получаем всех админов
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('*')
    
    if (error) {
      console.error('Error fetching admins:', error)
      return
    }
    
    console.log('Testing passwords for admins:')
    
    for (const admin of admins) {
      console.log(`\nAdmin: ${admin.username} (${admin.email})`)
      console.log('Password hash:', admin.password_hash)
      
      // Тестируем разные пароли
      const testPasswords = ['admin123', 'admin', 'password', '123456']
      
      for (const testPassword of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPassword, admin.password_hash)
          console.log(`  Password '${testPassword}': ${isValid ? 'VALID' : 'invalid'}`)
        } catch (err) {
          console.log(`  Password '${testPassword}': ERROR - ${err.message}`)
        }
      }
    }
    
    // Создаем новый хеш для пароля 'admin123'
    console.log('\nCreating new hash for password "admin123":')
    const newHash = await bcrypt.hash('admin123', 10)
    console.log('New hash:', newHash)
    
    // Проверяем новый хеш
    const isNewHashValid = await bcrypt.compare('admin123', newHash)
    console.log('New hash validation:', isNewHashValid)
    
  } catch (err) {
    console.error('Script error:', err)
  }
}

testPasswords()