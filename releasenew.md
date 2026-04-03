# Standupovka — План улучшений

> Проверено по актуальной документации Supabase, Next.js 15 и @supabase/ssr (апрель 2026).
>
> Приоритизация: сначала то, что может стоить денег или репутации, потом архитектура, потом удобство.
> Каждая фаза — самостоятельный деплой. Не нужно делать всё сразу.

---

## Фаза 0 — Аварийные исправления (день 1)

Эти проблемы могут привести к утечке данных, несанкционированному доступу или финансовым потерям прямо сейчас.

### 0.1 Удалить захардкоженные секреты из кода

**Файлы:**
- `src/lib/env.ts` — убрать fallback-значения для `SUPABASE_SERVICE_ROLE_KEY` и `SUPABASE_JWT_SECRET`
- `src/lib/supabase-middleware.ts:102-103` — убрать fallback anon key

**Что сделать:** Если env-переменная отсутствует — throw Error при старте. Приложение не должно работать с дефолтными ключами.

**Почему критично:** Service role key даёт полный доступ к БД без RLS. Сейчас он вшит в исходный код в трёх местах.

### 0.2 Исправить верификацию admin JWT

**Файл:** `src/lib/auth/admin-auth.ts:75`

**Что сделать:** Заменить `verifyAdminTokenSimple(token)` на `await verifyAdminToken(token)`. Функция `getAdminFromRequest` станет async — обновить вызовы в `middleware.ts` и всех admin API routes.

**Почему критично:** `verifyAdminTokenSimple` не проверяет подпись — любой может собрать поддельный admin-токен.

### 0.3 Закрыть утечку данных стрима через публичный API

**Файл:** `src/app/api/stream/[id]/route.ts`

**Что сделать:** Добавить проверку авторизации (getUser). Для неавторизованных — отдавать только `id`, `title`, `description`, `price`, `currency`, `stream_start_time`, `is_live`, `poster_url`. Никогда не отдавать без авторизации: `castr_rtmp_url`, `castr_stream_key`, `castr_playback_url`, `recorded_video_url`.

**Почему критично:** Сейчас любой может получить RTMP-ключ стрима и прямые ссылки на записи одним GET-запросом без авторизации.

### 0.4 Валидировать redirect-параметр в callback

**Файл:** `src/app/auth/callback/route.ts:10`

**Что сделать:** Проверить что `next` начинается с `/` и не начинается с `//`. Иначе — fallback на `/`.

```typescript
const raw = searchParams.get('redirect') ?? '/'
const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'
```

**Почему критично:** Open redirect — пользователь может быть перенаправлен на фишинговый сайт после логина.

### 0.5 Добавить авторизацию в /api/auth/validate-device

**Файл:** `src/app/api/auth/validate-device/route.ts`

**Что сделать:** Добавить `getUser()`, брать `userId` из сессии, а не из body запроса.

**Почему критично:** Сейчас любой может создавать/просматривать сессии чужих пользователей, передав произвольный userId.

### 0.6 Проверить git-историю на утечку .env.local

**Что сделать:**
```bash
git log --all --diff-filter=A -- .env.local
git log --all --diff-filter=A -- .env
```

Если файлы когда-либо коммитились — ротировать ВСЕ ключи: Supabase, MAIB, Resend, Fixie, JWT secret.

---

## Фаза 1 — Авторизация (2-3 дня)

Привести систему авторизации в рабочее состояние: сейчас написано много кода, но компоненты не связаны между собой.

### 1.1 Заменить getSession() на getUser() в серверных routes

> **Подтверждено документацией Supabase:** *"Always use `supabase.auth.getUser()` to protect pages and user data. Never trust `supabase.auth.getSession()` inside server code. It isn't guaranteed to revalidate the Auth token."*

**Файлы:**
- `src/app/api/stream/check-session/route.ts`
- `src/app/api/stream/close-session/route.ts`
- `src/app/api/payments/create/route.ts`
- `src/app/api/payments/status/route.ts`

**Что сделать:** `getSession()` не валидирует токен на сервере Supabase. В серверных route-ах всегда использовать `getUser()`.

### 1.1.1 Middleware должен обновлять cookies для API routes

> **Подтверждено документацией Supabase SSR и Next.js:** Middleware исключает API routes из redirect-логики (стандартный паттерн), но Supabase SSR middleware **должен** обрабатывать `/api/` routes для refresh auth-токенов через cookies.

**Файл:** `src/middleware.ts`

**Что сделать:** Разделить middleware на два этапа:
1. Для ВСЕХ routes (включая `/api/`) — обновлять Supabase session cookies через `supabase.auth.getUser()`
2. Только для page routes (исключая `/api/`, `/_next/`, статику) — redirect-логика

```typescript
export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request)
  // Обновляем session cookies для ВСЕХ routes (включая /api/)
  await supabase.auth.getUser()
  
  const { pathname } = request.nextUrl
  // Пропускаем redirect-логику для API и статики
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return response
  }
  // ... redirect-логика для page routes
}
```

### 1.2 Привязать проверку оплаты к конкретному стриму

**Файлы:**
- `src/app/page.tsx` (главная)
- `src/app/stream/page.tsx`
- `src/app/buy/page.tsx`

**Что сделать:** Добавить фильтр `.eq('metadata->>stream_id', streamId)` при проверке платежей. Сейчас любой completed-платёж даёт доступ ко всем стримам.

### 1.3 Защита от дублирования платежей

**Файл:** `src/app/api/payments/create/route.ts`

**Что сделать:** Перед созданием нового платежа проверять наличие `pending` или `processing` платежей для этого пользователя и стрима. Если есть — возвращать существующий `payUrl` или ошибку.

### 1.4 Переписать ограничение устройств (серверный concurrent session counting)

> Текущий подход (browser fingerprint) ненадёжен: fingerprint меняется при обновлении браузера, не работает в incognito, весь код не подключён к реальному flow. Правильный подход — серверный heartbeat.

**Удалить (мёртвый код):**
- `src/lib/fingerprint.ts` (180 строк, дублирует `lib/auth/fingerprint.ts`)
- `src/components/auth/device-validation.tsx` (нигде не используется)
- `src/hooks/useDeviceFingerprint.ts` — заменить на heartbeat-хук

**Новая архитектура — серверный heartbeat:**

1. При открытии страницы стрима → `POST /api/stream/start-session` (создаёт запись в `user_sessions` с `heartbeat_at = now()`)
2. Клиент каждые 30 сек → `POST /api/stream/heartbeat` (обновляет `heartbeat_at`)
3. При попытке начать второй просмотр → сервер проверяет: есть ли сессия с `heartbeat_at > now() - 2 min`? Если да → "Закройте на другом устройстве"
4. При закрытии вкладки → `POST /api/stream/end-session` (через `navigator.sendBeacon`)
5. Cron/cleanup: сессии с `heartbeat_at < now() - 5 min` → автоматически деактивируются

**Почему лучше fingerprint:**
- Невозможно обойти на клиенте (серверная проверка)
- Не зависит от браузера, incognito, VPN
- Точно определяет: пользователь реально смотрит или вкладка закрыта
- Простой код, нет зависимости от FingerprintJS

### 1.5 Добавить rate limiting на magic link

**Файл:** `src/app/api/auth/magic-link/route.ts`

**Что сделать:** Ограничить отправку magic link: максимум 3 запроса на email за 15 минут. Можно через простой in-memory Map (для Vercel — через KV/Upstash). Клиентский countdown (60 секунд) легко обойти.

### 1.6 Удалить fix-hash-fragment.js

**Файлы:**
- `src/app/auth/login/fix-hash-fragment.js` — удалить
- `src/app/auth/login/page.tsx` — убрать Script import
- `src/app/auth/callback/route.ts` — убрать обработку `access_token` из query params (строки 13-90)

**Почему:** Access token в query string логируется серверами и CDN. PKCE flow (`exchangeCodeForSession`) уже работает в том же файле (строки 93-147) и покрывает все кейсы.

> **Подтверждено документацией Supabase:** Все официальные примеры callback используют только `exchangeCodeForSession(code)`. Ручной `setSession` с access_token из URL — не рекомендуемый паттерн.

---

## Фаза 2 — Чистка архитектуры (3-4 дня)

Уменьшить количество дублирования и мёртвого кода. Сделать проект поддерживаемым.

### 2.1 Свести Supabase-клиенты к 2 файлам

**Текущее состояние — 5 файлов, делающих одно и то же:**
- `lib/supabase-client.ts`
- `lib/supabase.ts`
- `lib/auth/config.ts`
- `lib/auth/client-config.ts`
- `lib/supabase-middleware.ts` (со своей отдельной Database-типизацией)

**Целевое состояние (по документации Supabase — рекомендуется 2 файла + middleware inline):**

> **Из документации:** *"It is recommended to create essential utilities files and organize them within `lib/supabase` at the root of the project, with separate `client.ts` and `server.ts` files."*

```
src/lib/supabase/
  client.ts   — createBrowserClient (для 'use client' компонентов)
  server.ts   — createServerClient (для Server Components, Route Handlers, Server Actions)
  admin.ts    — createClient с service_role key (для webhook, admin API — без RLS)
```

Middleware-клиент создаётся inline в `middleware.ts` (по примеру из документации Supabase SSR).

Удалить дублирующий интерфейс `Database` из `supabase-middleware.ts` (таблицы `profiles`, `tasks`, `sessions` — это рудимент другого проекта).

### 2.2 Создать единую функцию проверки доступа

**Новый файл:** `src/lib/access.ts`

```typescript
export async function checkStreamAccess(userId: string, streamId: string): Promise<{
  hasAccess: boolean
  reason: 'free_access' | 'paid' | 'no_access'
}>
```

Использовать в `page.tsx`, `stream/page.tsx`, `buy/page.tsx` вместо дублирования логики проверки `free_access` + `payments`.

### 2.3 Решить судьбу Redis

**Текущее состояние:** Redis клиент (ioredis) подключается к `localhost:6379` при каждом import. В `.env.local` указан Upstash, но через REST URL/token, а `redis.ts` использует `REDIS_HOST`/`REDIS_PORT`. `SessionManager` и `CacheManager` написаны, но не используются в бизнес-логике.

**Варианты:**
- **Оставить:** Переписать на `@upstash/redis` (REST-based, работает на Vercel Edge). Использовать для rate limiting magic link и кэширования stream_settings.
- **Удалить (рекомендуется сейчас):** Убрать `redis.ts`, `lib/auth/session.ts`, все импорты Redis. Вернуть когда будет реальная потребность.

### 2.4 Решить судьбу React Query

**Текущее состояние:** `QueryClientProvider` + `ReactQueryDevtools` подключены через `providers.tsx`, но ни один компонент не использует `useQuery`/`useMutation`. Все запросы через `useEffect` + `fetch`.

**Варианты:**
- **Использовать:** Переписать `page.tsx`, `stream/page.tsx`, `buy/page.tsx` на `useQuery`. Это даст кэширование, авто-рефетч, loading/error states из коробки.
- **Удалить (быстрее):** Убрать `@tanstack/react-query` и `@tanstack/react-query-devtools` из dependencies, убрать `providers.tsx`.

### 2.5 Вынести данные события из хардкода

**Проблема:** Дата (21 Septembrie), цена (300 MDL), UUID стрима, описание — захардкожены в компонентах. При следующем событии нужно менять код и деплоить.

**Решение:** Главная страница (`page.tsx`) уже загружает `stream_settings` из Supabase. Передать `streamData` в `EventBlock` и использовать `streamData.price`, `streamData.stream_start_time`, `streamData.title` вместо хардкода.

**Файлы для изменения:**
- `src/app/page.tsx` — передать `streamData` в EventBlock
- `src/components/event-block.tsx` — принять и использовать данные из props
- `src/app/buy/page.tsx:323,391` — использовать `stream.price` вместо "300 MDL"

---

## Фаза 3 — Переход на Cloudflare Stream + удаление кастомного плеера (3-5 дней)

> Ключевое решение: отказ от Castr ($349/мес) и локального сервера `line.mediashowgrup.md` (сбои).
> Переход на Cloudflare Stream: pay-per-use (~$120-150 за событие, $1-2/мес без событий), автозапись через 60 сек, signed URLs, Cloudflare CDN, React-компонент.

### 3.1 Регистрация и настройка Cloudflare Stream

**Что сделать:**
1. Зарегистрироваться на Cloudflare (если нет аккаунта) → подключить Stream
2. Создать Live Input в dashboard или через API
3. Получить RTMPS URL + Stream Key для OBS
4. Включить `recording.mode: "automatic"` — стрим автоматически записывается, через 60 сек после завершения доступен как VOD

**Документация:** https://developers.cloudflare.com/stream/stream-live/start-stream-live/

**Env-переменные (добавить в .env.local и Vercel):**
```
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_STREAM_API_TOKEN=xxx
CLOUDFLARE_STREAM_SIGNING_KEY_ID=xxx
CLOUDFLARE_STREAM_SIGNING_KEY_JWK=xxx
```

### 3.2 Создать сервис для работы с Cloudflare Stream API

**Новый файл:** `src/lib/cloudflare-stream.ts`

```typescript
export class CloudflareStreamService {
  private accountId: string
  private apiToken: string

  // Создать Live Input (для нового стрима)
  async createLiveInput(name: string): Promise<{ rtmpsUrl: string, streamKey: string, inputId: string }>

  // Получить список записей для Live Input
  async getRecordings(inputId: string): Promise<{ videoId: string, duration: number, status: string }[]>

  // Сгенерировать signed URL с TTL (защита контента)
  async createSignedToken(videoId: string, expiresInSeconds: number): Promise<string>

  // Получить embed URL
  getEmbedUrl(videoId: string): string
  getSignedEmbedUrl(token: string): string
}
```

### 3.3 Обновить модель данных stream_settings

**Новые поля в таблице `stream_settings` (SQL миграция):**
```sql
ALTER TABLE stream_settings ADD COLUMN cf_input_id text;          -- Cloudflare Live Input ID
ALTER TABLE stream_settings ADD COLUMN cf_video_id text;          -- Cloudflare Video ID (для записи/VOD)
```

**Поля которые станут deprecated (оставить для обратной совместимости):**
- `castr_*` поля — больше не используются для новых событий
- `recorded_video_url` — заменяется на `cf_video_id` + signed URL

### 3.4 Удалить SecureVideoPlayer и заменить на Cloudflare Stream embed

**Удалить файлы:**
- `src/components/video/SecureVideoPlayer.tsx` (825 строк)
- `src/components/video/video-player.tsx`
- `src/components/video/YouTubePlayer.tsx` (если не используется)

**Новый файл:** `src/components/video/stream-player.tsx`

```tsx
// Вариант 1: React-компонент от Cloudflare
import { Stream } from "@cloudflare/stream-react"

export function StreamPlayer({ videoId, signedToken }: { videoId?: string, signedToken?: string }) {
  return <Stream controls src={signedToken || videoId} />
}

// Вариант 2: iframe (если не хочется тянуть зависимость)
export function StreamPlayer({ videoId, signedToken }: { videoId?: string, signedToken?: string }) {
  const src = signedToken
    ? `https://customer-${subdomain}.cloudflarestream.com/${signedToken}/iframe`
    : `https://customer-${subdomain}.cloudflarestream.com/${videoId}/iframe`
  return <iframe src={src} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
}
```

**Обновить `src/app/stream/page.tsx`:**
- Для live: использовать Cloudflare Stream player с Live Input
- Для записи: запросить signed token через API → передать в player

### 3.5 API endpoint для signed video URLs

**Новый файл:** `src/app/api/stream/video-token/route.ts`

```typescript
// POST /api/stream/video-token
// 1. getUser() — проверка авторизации
// 2. checkStreamAccess(userId, streamId) — проверка оплаты
// 3. CloudflareStreamService.createSignedToken(videoId, 900) — token на 15 мин
// 4. return { token }
```

Клиент запрашивает token → получает signed URL → передаёт в player. Token истекает через 15 минут — каждый зритель получает индивидуальный, невозможно расшарить.

### 3.6 Миграция существующей записи

Текущая запись (`stand_1080.mp4`, `stand_720.mp4`, `stand_480.mp4` на `line.mediashowgrup.md`):

1. Загрузить `stand_1080.mp4` в Cloudflare Stream через dashboard (drag & drop) или API
2. Cloudflare автоматически транскодирует в adaptive bitrate (не нужны отдельные 720/480)
3. Получить `cf_video_id` → обновить запись в `stream_settings`
4. Включить signed URLs для этого видео

**Время:** ~30 минут (загрузка + обновление БД)

### 3.7 Отказ от Castr

После успешного теста Cloudflare Stream:
1. Отменить подписку Castr Ultra ($349/мес)
2. Убрать `FIXIE_URL` из env (proxy для Castr больше не нужен)
3. Удалить castr_* поля из кода (оставить в БД для истории)

**Экономия: ~$200/мес ($2,400/год)**

---

## Фаза 4 — Качество и надёжность (2-3 дня)

### 4.1 Убрать дублирование типов

**Файл:** `src/lib/supabase-middleware.ts:5-97` содержит свой интерфейс `Database` с таблицами `profiles`, `tasks`, `sessions`, которые не соответствуют реальной схеме (`user_profiles`, `payments`, `user_sessions`). Удалить этот тип, использовать единый из `types/database.ts`.

### 4.2 Заменить `<img>` на `next/image`

**Файлы:**
- `src/components/event-block.tsx` — постер события, иконки
- `src/components/navbar.tsx` — логотип, иконки
- `src/components/auth/auth-form.tsx` — иконки

`next/image` даёт: lazy loading, автоматический WebP/AVIF, srcset для разных экранов, предотвращение CLS. Особенно важно для `event_poster.jpg` — крупное изображение.

### 4.3 Очистить пустые директории и файлы

**Удалить пустые директории:**
- `src/app/api/promo-codes/apply/`
- `src/app/api/promo-codes/validate/`
- `src/app/api/stream/access/`
- `src/app/api/test/`
- `src/app/dashboard/`

**Вынести или удалить скрипты из корня:**
- `create-admin.js`, `create-admin.sql` — перенести в `scripts/`
- `check-auth-settings.js`, `setup-supabase-auth-config.js`, `setup-supabase-smtp.js` — перенести в `scripts/`
- `add-recorded-video-url.sql` — перенести в `scripts/migrations/`

### 4.4 Убрать ReactQueryDevtools из production

**Файл:** `src/lib/providers.tsx`

Если React Query остаётся — обернуть Devtools в проверку:
```typescript
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

Если React Query удаляется (фаза 2.4) — удалить весь файл.

### 4.5 Консоль-логи в production

**Проблема:** Весь проект засыпан `console.log` с деталями запросов, ответов, credentials. Примеры:
- `maib.ts:108` — логирует project ID
- `admin/users/route.ts:10-13` — логирует наличие service key
- `admin-auth.ts:66-69` — логирует содержимое cookies

**Что сделать:** Заменить на structured logging (например, `pino`) с уровнями. В production — только `warn` и `error`. Или хотя бы убрать логи с sensitive data.

---

## Фаза 5 — Новая функциональность (по мере потребности)

Эти задачи не критичны, но повышают ценность продукта.

### 5.1 Мульти-событийность + архив записей

Сейчас вся система рассчитана на одно событие. UUID стрима захардкожен в `event-block.tsx` и `admin/page.tsx`.

**Структура главной страницы:**

```
┌──────────────────────────────────────────────────────┐
│  СЛЕДУЮЩЕЕ СОБЫТИЕ (hero-блок, как сейчас)           │
│  Данные из stream_settings WHERE is_active=true      │
│  AND stream_start_time > now()                       │
│  ORDER BY stream_start_time ASC LIMIT 1              │
│  [Countdown] [Купить билет 300 MDL / Смотреть]       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  АРХИВ ЗАПИСЕЙ                                       │
│  Данные из stream_settings WHERE is_active=true      │
│  AND (cf_video_id IS NOT NULL                        │
│       OR recorded_video_url IS NOT NULL)             │
│  ORDER BY stream_start_time DESC                     │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │  poster    │  │  poster    │  │  poster    │     │
│  │  "Шоу 1"  │  │  "Шоу 2"  │  │  "Шоу 3"  │     │
│  │  21 sept  │  │  15 aug   │  │  10 jul   │     │
│  │  300 MDL  │  │  200 MDL  │  │  Оплачено │     │
│  │ [Купить]  │  │ [Купить]  │  │ [Смотреть]│     │
│  └────────────┘  └────────────┘  └────────────┘     │
└──────────────────────────────────────────────────────┘
```

**Логика карточки архива:**
- Если пользователь НЕ залогинен → кнопка "Войти для покупки"
- Если залогинен + НЕ оплатил → кнопка "Купить запись — {price} MDL"
- Если залогинен + оплатил (проверка `payments` по `metadata.stream_id`) → кнопка "Смотреть запись"
- Если `free_access = true` → кнопка "Смотреть запись"

**Что нужно:**
- Убрать хардкоженный UUID стрима из `event-block.tsx` и `admin/page.tsx`
- Главная страница: query для ближайшего события + query для архива
- Компонент `StreamCard` для карточки архива
- Привязка платежа к конкретному стриму через `metadata.stream_id` (частично есть, но не проверяется — см. Фазу 1.2)
- Админка: создание нового события (Cloudflare Stream автоматически записывает → видео доступно через 60 сек)

### 5.2 Промокоды

Директории `api/promo-codes/apply` и `api/promo-codes/validate` созданы, но пусты. Если нужна эта функция:
- Таблица `promo_codes` в Supabase: `code`, `discount_percent`, `discount_amount`, `max_uses`, `current_uses`, `expires_at`, `is_active`
- API: validate (проверка кода) и apply (применение при создании платежа)
- UI: поле ввода промокода на странице `/buy`

### 5.3 Webhook retry и idempotency

**Файл:** `src/app/api/payments/webhook/route.ts`

**Проблема:** Нет защиты от повторной обработки одного webhook. Если MAIB отправит его дважды (retry при timeout) — email отправится повторно.

**Решение:** Перед обработкой проверять: если `payments.status` уже `completed` для этого `orderId` — возвращать `200 OK` без повторной обработки. Хранить `webhook_processed_at` в metadata.

### 5.4 Мониторинг

В `.env.local` указаны `SENTRY_DSN` и `VERCEL_ANALYTICS_ID`, но нигде не подключены.

**Что подключить:**
- Sentry для error tracking (Next.js SDK: `@sentry/nextjs`)
- Vercel Analytics для web vitals
- Uptime monitoring для критичных endpoints (`/api/payments/webhook`, `/api/auth/magic-link`)

---

## Порядок выполнения

```
Неделя 1:  Фаза 0 (день 1) → Фаза 1 (дни 2-4) → деплой
Неделя 2:  Фаза 2 (дни 1-4) → деплой
Неделя 3:  Фаза 3 (дни 1-3) + Фаза 4 (дни 3-5) → деплой
По мере потребности: Фаза 5
```

Каждая фаза — отдельная ветка, отдельный PR, отдельный деплой. Не мешать security-фиксы с рефакторингом.

---

## Приложение: Верификация плана по документации (апрель 2026)

Ключевые решения проверены по актуальной документации Supabase, Next.js 15 и @supabase/ssr.

| Решение в плане | Источник | Статус |
|---|---|---|
| `getUser()` вместо `getSession()` в серверном коде | [Supabase Docs: Building the app](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) — *"Never trust getSession() inside server code"* | Подтверждено |
| 2-3 файла Supabase-клиентов (client.ts, server.ts, admin.ts) | [Supabase Docs: Creating a client for SSR](https://supabase.com/docs/guides/auth/server-side/nextjs) — *"2 types of Supabase clients... organize within lib/supabase"* | Подтверждено, уточнено (3 файла вместо 4) |
| Middleware исключает API routes из redirect-логики | [Next.js Docs: Authentication](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/authentication.mdx) — matcher `/((?!api\|_next/static\|...)` | Подтверждено (стандартный паттерн) |
| Middleware должен обновлять Supabase cookies для /api/ | [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/nextjs) — *"Proxy to refresh expired Auth tokens"* | Добавлено в план (1.1.1) |
| Redirect-валидация `!next.startsWith('//')` | [Supabase Docs: OAuth callback](https://github.com/supabase/supabase) — `if (!next.startsWith('/')) next = '/'` | Подтверждено, наш вариант строже |
| Удаление fix-hash-fragment.js, только PKCE flow | [Supabase Docs: все примеры callback](https://supabase.com/docs) — только `exchangeCodeForSession(code)` | Подтверждено |
| Каждый API route проверяет auth самостоятельно | [Next.js Docs: Protecting API Routes](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/authentication.mdx) — *"crucial to secure these routes"* | Подтверждено |
| Server Actions тоже требуют проверки auth | [Next.js Docs: Data Security](https://github.com/vercel/next.js/blob/canary/docs/01-app/02-guides/data-security.mdx) — *"re-verification of user authorization directly within Server Action"* | Учтено на будущее |

**Альтернативные подходы, которые были проверены и отклонены:**

1. **Middleware для защиты API routes (redirect)** — документация Next.js явно исключает `/api/` из matcher. API routes защищаются внутри handler, не через middleware redirect.

2. **Единый Supabase-клиент для всего** — документация требует раздельные client/server из-за различий в работе с cookies (browser vs server-side).

3. **NextAuth/Auth.js вместо Supabase Auth** — избыточно. Supabase Auth покрывает magic link, session management, JWT. Добавление NextAuth создаст конфликт двух auth-систем.
