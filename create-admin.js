#!/usr/bin/env node

/**
 * Скрипт для создания нового администратора
 * Использование: node create-admin.js <username> <email> <password> [full_name]
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Проверяем переменные окружения
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Ошибка: Не найдены переменные окружения NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Создаем клиент Supabase с правами администратора
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin(username, email, password, fullName = null) {
  try {
    console.log('🔄 Создание нового администратора...');
    
    // Хешируем пароль
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log(`📝 Данные админа:`);
    console.log(`   Логин: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Полное имя: ${fullName || 'Не указано'}`);
    
    // Проверяем, существует ли таблица admin_users
    const { data: tableExists, error: tableError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    if (tableError && tableError.code === '42P01') {
      console.log('⚠️  Таблица admin_users не существует. Создаем...');
      
      // Создаем таблицу
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS admin_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
          CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
          CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
        `
      });
      
      if (createTableError) {
        console.error('❌ Ошибка создания таблицы:', createTableError.message);
        console.log('\n📋 Выполните SQL скрипт create-admin.sql в Supabase Dashboard вручную.');
      } else {
        console.log('✅ Таблица admin_users создана успешно');
      }
    }
    
    // Проверяем, существует ли уже админ с таким логином или email
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`);
    
    if (checkError) {
      console.error('❌ Ошибка проверки существующего админа:', checkError.message);
      return;
    }
    
    if (existingAdmin && existingAdmin.length > 0) {
      const existing = existingAdmin[0];
      if (existing.username === username) {
        console.error(`❌ Администратор с логином "${username}" уже существует`);
        return;
      }
      if (existing.email === email) {
        console.error(`❌ Администратор с email "${email}" уже существует`);
        return;
      }
    }
    
    // Создаем нового админа
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        is_active: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Ошибка создания администратора:', insertError.message);
      return;
    }
    
    console.log('\n✅ Администратор успешно создан!');
    console.log(`📋 ID: ${newAdmin.id}`);
    console.log(`👤 Логин: ${newAdmin.username}`);
    console.log(`📧 Email: ${newAdmin.email}`);
    console.log(`📅 Создан: ${new Date(newAdmin.created_at).toLocaleString('ru-RU')}`);
    
    console.log('\n🔐 Данные для входа:');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/login`);
    console.log(`   Логин: ${username}`);
    console.log(`   Пароль: ${password}`);
    
  } catch (error) {
    console.error('❌ Неожиданная ошибка:', error.message);
  }
}

// Парсим аргументы командной строки
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('📖 Использование: node create-admin.js <username> <email> <password> [full_name]');
  console.log('\n📝 Примеры:');
  console.log('   node create-admin.js admin admin@example.com admin123');
  console.log('   node create-admin.js webadmin web@standupovka.com mypassword "Web Admin"');
  process.exit(1);
}

const [username, email, password, fullName] = args;

// Валидация входных данных
if (username.length < 3) {
  console.error('❌ Логин должен содержать минимум 3 символа');
  process.exit(1);
}

if (!email.includes('@')) {
  console.error('❌ Некорректный email адрес');
  process.exit(1);
}

if (password.length < 6) {
  console.error('❌ Пароль должен содержать минимум 6 символов');
  process.exit(1);
}

// Запускаем создание админа
createAdmin(username, email, password, fullName)
  .then(() => {
    console.log('\n🎉 Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });