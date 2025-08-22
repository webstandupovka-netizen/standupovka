require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function changeAdminPassword(username, newPassword) {
  try {
    console.log(`Изменение пароля для админа: ${username}`)
    
    // Проверяем, существует ли админ
    const { data: admin, error: findError } = await supabase
      .from('admin_users')
      .select('username, email, is_active')
      .eq('username', username)
      .single()
    
    if (findError || !admin) {
      console.error('❌ Админ с таким логином не найден')
      return false
    }
    
    if (!admin.is_active) {
      console.error('❌ Админ неактивен')
      return false
    }
    
    // Хешируем новый пароль
    const passwordHash = await bcrypt.hash(newPassword, 10)
    
    // Обновляем пароль
    const { error } = await supabase
      .from('admin_users')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('username', username)
    
    if (error) {
      console.error('❌ Ошибка изменения пароля:', error)
      return false
    }
    
    console.log(`✅ Пароль для админа ${username} успешно изменен!`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Новый пароль: ${newPassword}`)
    
    return true
    
  } catch (err) {
    console.error('❌ Ошибка:', err)
    return false
  }
}

// Использование из командной строки
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Использование: node change-admin-password.js <username> <newPassword>')
    console.log('Пример: node change-admin-password.js admin newpassword123')
    process.exit(1)
  }
  
  const [username, newPassword] = args
  
  changeAdminPassword(username, newPassword)
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(err => {
      console.error('Ошибка:', err)
      process.exit(1)
    })
}

module.exports = { changeAdminPassword }