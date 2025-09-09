# Инструкция по деплою на Vercel

## Настройка переменных окружения

Для корректной работы приложения на продакшне необходимо установить следующие переменные окружения в панели Vercel:

### Обязательные переменные:

1. **FIXIE_URL** - URL прокси Fixie для статического IP
   ```
   http://fixie:IwdUbJzKgYFgCbf@ventoux.usefixie.com:80
   ```

2. **NODE_ENV** - окружение (должно быть `production`)
   ```
   production
   ```

3. **NEXT_PUBLIC_SUPABASE_URL** - URL Supabase
   ```
   https://npxqxjrunqroavlzvdce.supabase.co
   ```

4. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - публичный ключ Supabase
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHF4anJ1bnFyb2F2bHp2ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDMyNjksImV4cCI6MjA2OTg3OTI2OX0.XQfiVXttJb1ZP6-71zazAYnuf4hyuf-EQ7s9wXMr3OI
   ```

5. **SUPABASE_SERVICE_ROLE_KEY** - сервисный ключ Supabase
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weHF4anJ1bnFyb2F2bHp2ZGNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMzI2OSwiZXhwIjoyMDY5ODc5MjY5fQ.djelKooVaM6Mdp1HvNrXz00ZVd78y98yUw6xEL-OlW4
   ```

6. **MAIB_PROJECT_ID** - ID проекта MAIB
7. **MAIB_PROJECT_SECRET** - секретный ключ MAIB
8. **MAIB_SIGNATURE_KEY** - ключ подписи MAIB

## Как установить переменные в Vercel:

1. Откройте проект в панели Vercel
2. Перейдите в Settings → Environment Variables
3. Добавьте каждую переменную:
   - Name: имя переменной (например, FIXIE_URL)
   - Value: значение переменной
   - Environments: выберите Production, Preview, Development
4. Нажмите "Save"

## Важные моменты:

### Прокси Fixie
- **FIXIE_URL** критически важна для работы MAIB API
- Без неё будет ошибка "b is not a function"
- Убедитесь, что URL правильный и содержит учетные данные

### NODE_ENV
- Должна быть установлена в `production`
- Это активирует использование прокси в коде

### Проверка после деплоя
- Проверьте логи Vercel на наличие ошибок
- Убедитесь, что MAIB Service инициализируется корректно
- Проверьте, что нет ошибки "b is not a function"

## Команды для деплоя:

```bash
# Установка Vercel CLI (если не установлен)
npm i -g vercel

# Деплой
vercel --prod

# Или через Git (автоматический деплой)
git push origin main
```

## Устранение проблем:

### Ошибка "b is not a function"
1. Проверьте, что FIXIE_URL установлена
2. Проверьте, что NODE_ENV = production
3. Убедитесь, что прокси работает

### Ошибки MAIB API
1. Проверьте MAIB_* переменные
2. Убедитесь, что прокси активен
3. Проверьте логи Vercel Functions

### Ошибки Supabase
1. Проверьте SUPABASE_* переменные
2. Убедитесь, что URL и ключи корректны

## Мониторинг

- Используйте Vercel Analytics для мониторинга
- Проверяйте логи Functions в реальном времени
- Настройте уведомления об ошибках