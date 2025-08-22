require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addAdmin(username, email, password, fullName = null) {
  try {
    console.log(`Создание админа: ${username} (${email})`)
    
    // Проверяем, не существует ли уже такой админ
    const { data: existing } = await supabase
      .from('admin_users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`)
    
    if (existing && existing.length > 0) {
      console.error('❌ Ошибка: Админ с таким логином или email уже существует')
      return false
    }
    
    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Создаем админа
    const { error } = await supabase
      .from('admin_users')
      .insert({
        username,
        email,
        full_name: fullName,
        password_hash: passwordHash
      })
    
    if (error) {
      console.error('❌ Ошибка создания админа:', error)
      return false
    }
    
    console.log(`✅ Админ ${username} успешно создан!`)
    console.log(`   Email: ${email}`)
    console.log(`   Пароль: ${password}`)
    if (fullName) console.log(`   Имя: ${fullName}`)
    
    return true
    
  } catch (err) {
    console.error('❌ Ошибка:', err)
    return false
  }
}

// Использование из командной строки
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.log('Использование: node add-admin.js <username> <email> <password> [fullName]')
    console.log('Пример: node add-admin.js newadmin admin@example.com mypassword "Новый Админ"')
    process.exit(1)
  }
  
  const [username, email, password, fullName] = args
  
  addAdmin(username, email, password, fullName)
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(err => {
      console.error('Ошибка:', err)
      process.exit(1)
    })
}

module.exports = { addAdmin }