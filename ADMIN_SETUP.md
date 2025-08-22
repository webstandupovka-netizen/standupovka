# Создание администратора

Данное руководство поможет вам создать нового администратора для системы Standupovka.

## Способы создания админа

### 1. Автоматический способ (рекомендуется)

Используйте Node.js скрипт для автоматического создания админа:

```bash
# Установите зависимости (если еще не установлены)
npm install

# Создайте админа
node create-admin.js <логин> <email> <пароль> [полное_имя]
```

**Примеры:**
```bash
# Простой админ
node create-admin.js admin admin@standupovka.com admin123

# Админ с полным именем
node create-admin.js webadmin web@standupovka.com mypassword "Web Administrator"
```

### 2. Ручной способ через SQL

Если автоматический способ не работает, выполните SQL скрипт в Supabase Dashboard:

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в ваш проект
3. Откройте SQL Editor
4. Выполните содержимое файла `create-admin.sql`
5. Измените данные админа в скрипте перед выполнением

### 3. Создание через Supabase Dashboard

1. Откройте Table Editor в Supabase
2. Найдите таблицу `admin_users` (создайте если нет)
3. Добавьте новую запись:
   - `username`: ваш логин
   - `email`: ваш email
   - `password_hash`: хешированный пароль (используйте онлайн bcrypt генератор)
   - `full_name`: полное имя (опционально)
   - `is_active`: true

## Структура таблицы admin_users

```sql
CREATE TABLE admin_users (
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
```

## Готовые админы для тестирования

В SQL скрипте уже есть два готовых админа:

1. **Логин:** `admin`
   - **Пароль:** `admin123`
   - **Email:** `admin@standupovka.com`

2. **Логин:** `webstandupovka`
   - **Пароль:** `password123`
   - **Email:** `webstandupovka.netizen@gmail.com`

## Вход в админ панель

После создания админа:

1. Откройте: `http://localhost:3001/admin/login` (для разработки)
2. Или: `https://ваш-домен.com/admin/login` (для продакшена)
3. Введите логин и пароль
4. Нажмите "Войти"

## Хеширование паролей

Система использует bcrypt для хеширования паролей с salt rounds = 12.

Для генерации хеша пароля вручную:

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('ваш_пароль', 12);
console.log(hash);
```

Или используйте онлайн генератор bcrypt.

## Устранение проблем

### Ошибка "Таблица не существует"

1. Выполните SQL скрипт `create-admin.sql` в Supabase
2. Убедитесь, что у вас есть права на создание таблиц

### Ошибка "Переменные окружения не найдены"

1. Проверьте файл `.env.local`
2. Убедитесь, что есть:
   ```
   NEXT_PUBLIC_SUPABASE_URL=ваш_url
   SUPABASE_SERVICE_ROLE_KEY=ваш_ключ
   ```

### Ошибка "Админ уже существует"

1. Используйте другой логин или email
2. Или удалите существующего админа из таблицы

### Не можете войти

1. Проверьте правильность логина и пароля
2. Убедитесь, что `is_active = true`
3. Проверьте, что таблица `admin_users` содержит вашего админа

## Безопасность

- Используйте сложные пароли (минимум 8 символов)
- Не используйте одинаковые пароли для разных админов
- Регулярно меняйте пароли
- Удаляйте неактивных админов
- Не храните пароли в открытом виде

## Управление админами

Для изменения данных админа используйте SQL запросы в Supabase:

```sql
-- Изменить пароль
UPDATE admin_users 
SET password_hash = 'новый_хеш_пароля' 
WHERE username = 'логин_админа';

-- Деактивировать админа
UPDATE admin_users 
SET is_active = false 
WHERE username = 'логин_админа';

-- Удалить админа
DELETE FROM admin_users 
WHERE username = 'логин_админа';
```