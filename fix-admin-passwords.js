require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAdminPasswords() {
  try {
    console.log('Fixing admin passwords...')
    
    // Создаем правильные хеши для паролей
    const adminHash = await bcrypt.hash('admin123', 10)
    const admin1Hash = await bcrypt.hash('123456', 10)
    
    console.log('Generated hashes:')
    console.log('admin123 hash:', adminHash)
    console.log('123456 hash:', admin1Hash)
    
    // Обновляем пароль для admin
    const { error: error1 } = await supabase
      .from('admin_users')
      .update({ password_hash: adminHash })
      .eq('username', 'admin')
    
    if (error1) {
      console.error('Error updating admin password:', error1)
    } else {
      console.log('✓ Updated password for admin (password: admin123)')
    }
    
    // Обновляем пароль для admin1
    const { error: error2 } = await supabase
      .from('admin_users')
      .update({ password_hash: admin1Hash })
      .eq('username', 'admin1')
    
    if (error2) {
      console.error('Error updating admin1 password:', error2)
    } else {
      console.log('✓ Updated password for admin1 (password: 123456)')
    }
    
    // Проверяем результат
    console.log('\nVerifying passwords...')
    
    const { data: admins } = await supabase
      .from('admin_users')
      .select('username, password_hash')
    
    for (const admin of admins) {
      const testPassword = admin.username === 'admin' ? 'admin123' : '123456'
      const isValid = await bcrypt.compare(testPassword, admin.password_hash)
      console.log(`${admin.username}: password '${testPassword}' - ${isValid ? 'VALID' : 'INVALID'}`)
    }
    
  } catch (err) {
    console.error('Script error:', err)
  }
}

fixAdminPasswords()