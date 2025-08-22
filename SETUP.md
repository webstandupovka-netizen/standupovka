# Настройка проекта Standup

## Обзор архитектуры

Проект настроен с использованием следующих технологий:
- **Next.js 15** - фреймворк для React
- **Supabase** - база данных и аутентификация
- **Redis** - кэширование сессий
- **FingerprintJS** - идентификация устройств
- **TypeScript** - типизация

## Структура базы данных

### Таблицы

1. **user_profiles** - профили пользователей
2. **payments** - платежи и транзакции
3. **user_sessions** - сессии пользователей с отпечатками устройств
4. **stream_settings** - настройки стримов
5. **access_logs** - логи доступа
6. **email_logs** - логи отправки email

### Применение схемы

Выполните SQL из файла `data.sql` в вашей Supabase базе данных:

```bash
# Скопируйте содержимое data.sql и выполните в Supabase SQL Editor
```

## Переменные окружения

Создайте файл `.env.local` со следующими переменными:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Redis (если используете внешний Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# FingerprintJS
NEXT_PUBLIC_FINGERPRINTJS_PUBLIC_KEY=your_fingerprint_key

# MAIB Payment
MAIB_PROJECT_ID=your_maib_project_id
MAIB_PROJECT_SECRET=your_maib_secret

# Vimeo
VIMEO_ACCESS_TOKEN=your_vimeo_token
```

## Установка зависимостей

```bash
npm install
```

## Запуск проекта

```bash
# Разработка
npm run dev

# Продакшн
npm run build
npm start
```

## Основные компоненты

### Аутентификация

- **SessionManager** (`src/lib/auth/session.ts`) - управление сессиями
- **FingerprintService** (`src/lib/auth/fingerprint.ts`) - идентификация устройств
- **DeviceValidation** (`src/components/auth/device-validation.tsx`) - компонент валидации

### База данных

- **Database types** (`src/types/database.ts`) - типы TypeScript для базы
- **Supabase client** (`src/lib/database/client.ts`) - клиенты для браузера и сервера
- **Redis client** (`src/lib/redis.ts`) - клиент Redis для кэширования

### Middleware

- **Authentication middleware** (`src/middleware.ts`) - защита роутов, проверка платежей и админских прав

## API роуты

### `/api/auth/validate-device`

Проверяет и создает сессии устройств:

```typescript
POST /api/auth/validate-device
{
  "userId": "string",
  "fingerprintId": "string",
  "deviceInfo": {}
}
```

## Защищенные роуты

- `/dashboard` - требует аутентификации
- `/stream` - требует аутентификации + оплаты
- `/admin` - требует админских прав (admin@standupovka.md)

## Лимиты безопасности

- Максимум 3 активных устройства на пользователя
- Сессии истекают через 24 часа
- Автоматическая деактивация старых сессий

## Использование в компонентах

```typescript
// Хук для работы с пользователем
import { useUser } from '@/hooks/useUser'

function MyComponent() {
  const { user, profile, loading, signOut } = useUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return <div>Hello, {profile?.full_name}</div>
}

// Валидация устройства
import { DeviceValidation } from '@/components/auth/device-validation'

function Dashboard() {
  const { user } = useUser()
  
  return (
    <div>
      {user && (
        <DeviceValidation 
          userId={user.id}
          onValidationComplete={(isValid) => {
            if (!isValid) {
              // Обработка неудачной валидации
            }
          }}
        />
      )}
    </div>
  )
}
```

## Мониторинг и логирование

- Все действия пользователей логируются в `access_logs`
- Email уведомления отслеживаются в `email_logs`
- Redis используется для кэширования сессий

## Развертывание

1. Настройте Supabase проект
2. Примените схему базы данных из `data.sql`
3. Настройте переменные окружения
4. Разверните на Vercel или другой платформе
5. Настройте Redis (Upstash или собственный)

## Безопасность

- Row Level Security (RLS) включен для всех таблиц
- Пользователи могут видеть только свои данные
- Админы имеют доступ ко всем платежам
- Сессии автоматически очищаются при истечении