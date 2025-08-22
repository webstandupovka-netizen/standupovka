require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function listAdmins() {
  console.log('\n=== Список админов ===')
  const { data: admins, error } = await supabase
    .from('admin_users')
    .select('username, email, full_name, is_active, created_at, last_login')
    .order('created_at')
  
  if (error) {
    console.error('Ошибка получения админов:', error)
    return
  }
  
  if (admins.length === 0) {
    console.log('Админы не найдены')
    return
  }
  
  admins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.username} (${admin.email})`)
    console.log(`   Имя: ${admin.full_name || 'Не указано'}`)
    console.log(`   Активен: ${admin.is_active ? 'Да' : 'Нет'}`)
    console.log(`   Создан: ${new Date(admin.created_at).toLocaleString('ru-RU')}`)
    console.log(`   Последний вход: ${admin.last_login ? new Date(admin.last_login).toLocaleString('ru-RU') : 'Никогда'}`)
    console.log('')
  })
}

async function createAdmin() {
  console.log('\n=== Создание нового админа ===')
  
  const username = await question('Введите логин: ')
  if (!username.trim()) {
    console.log('Логин не может быть пустым')
    return
  }
  
  const email = await question('Введите email: ')
  if (!email.trim()) {
    console.log('Email не может быть пустым')
    return
  }
  
  const fullName = await question('Введите полное имя (необязательно): ')
  const password = await question('Введите пароль: ')
  
  if (!password.trim()) {
    console.log('Пароль не может быть пустым')
    return
  }
  
  try {
    // Проверяем, не существует ли уже такой админ
    const { data: existing } = await supabase
      .from('admin_users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`)
    
    if (existing && existing.length > 0) {
      console.log('Ошибка: Админ с таким логином или email уже существует')
      return
    }
    
    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Создаем админа
    const { error } = await supabase
      .from('admin_users')
      .insert({
        username: username.trim(),
        email: email.trim(),
        full_name: fullName.trim() || null,
        password_hash: passwordHash
      })
    
    if (error) {
      console.error('Ошибка создания админа:', error)
      return
    }
    
    console.log(`✓ Админ ${username} успешно создан!`)
    
  } catch (err) {
    console.error('Ошибка:', err)
  }
}

async function changePassword() {
  console.log('\n=== Изменение пароля админа ===')
  
  // Показываем список админов
  await listAdmins()
  
  const username = await question('Введите логин админа для изменения пароля: ')
  if (!username.trim()) {
    console.log('Логин не может быть пустым')
    return
  }
  
  // Проверяем, существует ли админ
  const { data: admin, error: findError } = await supabase
    .from('admin_users')
    .select('username, email')
    .eq('username', username.trim())
    .single()
  
  if (findError || !admin) {
    console.log('Админ с таким логином не найден')
    return
  }
  
  const newPassword = await question('Введите новый пароль: ')
  if (!newPassword.trim()) {
    console.log('Пароль не может быть пустым')
    return
  }
  
  try {
    // Хешируем новый пароль
    const passwordHash = await bcrypt.hash(newPassword, 10)
    
    // Обновляем пароль
    const { error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('username', username.trim())
    
    if (error) {
      console.error('Ошибка изменения пароля:', error)
      return
    }
    
    console.log(`✓ Пароль для админа ${username} успешно изменен!`)
    
  } catch (err) {
    console.error('Ошибка:', err)
  }
}

async function deleteAdmin() {
  console.log('\n=== Удаление админа ===')
  
  // Показываем список админов
  await listAdmins()
  
  const username = await question('Введите логин админа для удаления: ')
  if (!username.trim()) {
    console.log('Логин не может быть пустым')
    return
  }
  
  // Проверяем, существует ли админ
  const { data: admin, error: findError } = await supabase
    .from('admin_users')
    .select('username, email')
    .eq('username', username.trim())
    .single()
  
  if (findError || !admin) {
    console.log('Админ с таким логином не найден')
    return
  }
  
  const confirm = await question(`Вы уверены, что хотите удалить админа ${username}? (да/нет): `)
  if (confirm.toLowerCase() !== 'да' && confirm.toLowerCase() !== 'yes') {
    console.log('Удаление отменено')
    return
  }
  
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('username', username.trim())
    
    if (error) {
      console.error('Ошибка удаления админа:', error)
      return
    }
    
    console.log(`✓ Админ ${username} успешно удален!`)
    
  } catch (err) {
    console.error('Ошибка:', err)
  }
}

async function main() {
  console.log('=== Управление админскими пользователями ===')
  console.log('1. Показать список админов')
  console.log('2. Создать нового админа')
  console.log('3. Изменить пароль админа')
  console.log('4. Удалить админа')
  console.log('5. Выход')
  
  while (true) {
    const choice = await question('\nВыберите действие (1-5): ')
    
    switch (choice) {
      case '1':
        await listAdmins()
        break
      case '2':
        await createAdmin()
        break
      case '3':
        await changePassword()
        break
      case '4':
        await deleteAdmin()
        break
      case '5':
        console.log('До свидания!')
        rl.close()
        return
      default:
        console.log('Неверный выбор. Попробуйте снова.')
    }
  }
}

if (require.main === module) {
  main().catch(console.error)
}