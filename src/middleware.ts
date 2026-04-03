import { createSupabaseMiddlewareClient } from '@/lib/supabase-middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin-auth'

// Маршруты, которые требуют аутентификации
const protectedRoutes = ['/profile', '/stream']

// Маршруты, доступные только неаутентифицированным пользователям
const authRoutes = ['/auth/login']

// Админские маршруты
const adminRoutes = ['/admin']
// Публичные админские маршруты (не требуют аутентификации)
const publicAdminRoutes = ['/admin/login']

// Maintenance mode — если PREVIEW_SECRET задан, сайт закрыт для всех кроме тех у кого есть cookie
const MAINTENANCE_MODE = !!process.env.PREVIEW_SECRET

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем статические файлы без обработки
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // === MAINTENANCE MODE ===
  // Если PREVIEW_SECRET задан — проверяем cookie. Пропускаем /preview, /coming-soon, /api/, /admin
  if (MAINTENANCE_MODE) {
    const bypassRoutes = ['/preview', '/coming-soon', '/api/', '/admin', '/auth']
    const isBypassed = bypassRoutes.some(r => pathname.startsWith(r))

    if (!isBypassed) {
      const previewCookie = request.cookies.get('preview-access')?.value
      if (previewCookie !== process.env.PREVIEW_SECRET) {
        return NextResponse.redirect(new URL('/coming-soon', request.url))
      }
    }
  }

  // Создаём Supabase middleware client — обновляет auth cookies для ВСЕХ routes (включая /api/)
  const { supabase, response } = createSupabaseMiddlewareClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  // Для API routes — только обновление cookies, без redirect-логики
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Далее — redirect-логика только для page routes
  const isAuthenticated = !!user
  const isAdmin = await isAdminAuthenticated(request)

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isPublicAdminRoute = publicAdminRoutes.some(route => pathname.startsWith(route))

  // Если админ авторизован, предоставляем доступ ко всем страницам
  if (isAdmin) {
    return response
  }

  // Логика для админских маршрутов (если админ не авторизован)
  if (isAdminRoute && !isPublicAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Если пользователь не аутентифицирован и пытается получить доступ к защищенному маршруту
  if (!isAuthenticated && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    const fullPath = pathname + request.nextUrl.search
    redirectUrl.searchParams.set('redirect', fullPath)
    return NextResponse.redirect(redirectUrl)
  }

  // Если пользователь аутентифицирован и пытается получить доступ к странице входа
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
