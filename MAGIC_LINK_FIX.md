# 🔧 Исправление проблемы с Magic Link

## 🚨 Проблема
Ваша ссылка для входа показывает ошибку `otp_expired` - "Email link is invalid or has expired".

**Причина:** Magic links в Supabase по умолчанию истекают через 5 минут, что слишком мало для пользователей.

## ✅ Решение

### Вариант 1: Через Supabase Dashboard (Рекомендуется)

1. **Откройте Supabase Dashboard:**
   - Перейдите на https://supabase.com/dashboard
   - Войдите в свой аккаунт
   - Выберите проект `npxqxjrunqroavlzvdce`

2. **Настройте время жизни Magic Link:**
   - Перейдите в раздел **Authentication** → **Settings**
   - Найдите секцию **"Email"** или **"Magic Link Settings"**
   - Найдите поле **"Magic Link Expiry"** (по умолчанию 300 секунд)
   - Измените значение на **3600** (1 час) или **7200** (2 часа)
   - Нажмите **"Save"**

3. **Дополнительные настройки:**
   - Убедитесь, что **Site URL** установлен как `https://www.standupovka.live`
   - В **Redirect URLs** должны быть:
     - `https://www.standupovka.live/auth/callback`
     - `http://localhost:3001/auth/callback` (для разработки)

### Вариант 2: Через Management API

1. **Получите Access Token:**
   - Перейдите на https://supabase.com/dashboard/account/tokens
   - Создайте новый токен с правами на управление проектом
   - Скопируйте токен

2. **Добавьте токен в .env.local:**
   ```bash
   echo "SUPABASE_ACCESS_TOKEN=your-token-here" >> .env.local
   ```

3. **Запустите скрипт конфигурации:**
   ```bash
   node setup-supabase-auth-config.js
   ```

## 🧪 Тестирование

1. **Запросите новый Magic Link:**
   - Перейдите на https://www.standupovka.live/auth/login
   - Введите свой email
   - Нажмите "Trimite link de conectare"

2. **Проверьте email:**
   - Откройте письмо от Standupovka
   - Кликните на кнопку "Conectează-te"
   - Вы должны быть перенаправлены на сайт и автоматически войти

## 📊 Текущее состояние

✅ **Работает:**
- SMTP настроен (Resend)
- Magic link генерируется
- Email отправляется
- Redirect URLs настроены

❌ **Проблема:**
- Magic links истекают через 5 минут
- Пользователи не успевают кликнуть по ссылке

## 🔍 Диагностика

Для проверки текущих настроек запустите:
```bash
node check-auth-settings.js
```

## 📝 Дополнительные улучшения

1. **Увеличьте время жизни JWT токенов:**
   - В Supabase Dashboard → Authentication → Settings
   - JWT expiry: 3600 секунд (1 час)

2. **Включите Refresh Token Rotation:**
   - Для дополнительной безопасности

3. **Настройте Rate Limiting:**
   - Ограничьте количество запросов magic links
   - Например, 1 письмо в минуту на email

## 🚀 После исправления

После увеличения времени жизни magic links:
- Пользователи будут иметь 1-2 часа для клика по ссылке
- Ошибка `otp_expired` должна исчезнуть
- Аутентификация будет работать стабильно

---

**Важно:** После изменения настроек в Supabase Dashboard изменения применяются немедленно. Новые magic links будут иметь увеличенное время жизни.