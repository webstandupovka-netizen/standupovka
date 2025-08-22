# Управление админскими пользователями

Этот документ описывает, как управлять админскими пользователями в системе.

## Текущие админы

- **admin** - пароль: `admin123`, email: korcevoy.ui@gmail.com
- **admin1** - пароль: `123456`, email: akorcevoy@gmail.com

## Способы управления

### 1. Интерактивное управление

Используйте скрипт с меню для полного управления:

```bash
node manage-admin-users.js
```

Возможности:
- Просмотр списка всех админов
- Создание нового админа
- Изменение пароля существующего админа
- Удаление админа

### 2. Быстрое добавление админа

```bash
node add-admin.js <username> <email> <password> [fullName]
```

Пример:
```bash
node add-admin.js newadmin admin@example.com mypassword "Новый Админ"
```

### 3. Быстрое изменение пароля

```bash
node change-admin-password.js <username> <newPassword>
```

Пример:
```bash
node change-admin-password.js admin newpassword123
```

### 4. Управление через SQL (Supabase Dashboard)

#### Создание нового админа:
```sql
INSERT INTO admin_users (username, password_hash, email, full_name)
VALUES (
  'новый_логин',
  crypt('пароль', gen_salt('bf')),
  'email@example.com',
  'Полное Имя'
);
```

#### Изменение пароля:
```sql
UPDATE admin_users 
SET password_hash = crypt('новый_пароль', gen_salt('bf'))
WHERE username = 'логин_админа';
```

#### Изменение логина:
```sql
UPDATE admin_users 
SET username = 'новый_логин' 
WHERE username = 'старый_логин';
```

#### Деактивация админа:
```sql
UPDATE admin_users 
SET is_active = false 
WHERE username = 'логин_админа';
```

#### Удаление админа:
```sql
DELETE FROM admin_users 
WHERE username = 'логин_админа';
```

## Структура таблицы admin_users

```sql
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Безопасность

- Пароли автоматически хешируются с помощью bcrypt
- Используется Row Level Security (RLS)
- Доступ к таблице только через service_role
- JWT токены для аутентификации в приложении
- HTTP-only cookies для безопасности

## Вход в админ панель

1. Перейдите на `/admin/login`
2. Введите логин и пароль
3. После успешного входа вы будете перенаправлены на `/admin`
4. Для выхода нажмите кнопку "Выйти" в правом верхнем углу

## Troubleshooting

### Ошибка "Неверный логин или пароль"

1. Проверьте, что админ существует:
   ```bash
   node check-admin-users.js
   ```

2. Убедитесь, что пароль правильно захеширован:
   ```bash
   node test-admin-passwords.js
   ```

3. Если нужно, исправьте пароли:
   ```bash
   node fix-admin-passwords.js
   ```

### Проблемы с доступом

- Убедитесь, что переменные окружения настроены в `.env.local`
- Проверьте, что таблица `admin_users` создана в Supabase
- Убедитесь, что RLS политики настроены правильно