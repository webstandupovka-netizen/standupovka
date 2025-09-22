import { createSupabaseMiddlewareClient } from '@/lib/supabase-middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth/admin-auth'

// Маршруты, которые требуют аутентификации
const protectedRoutes = ['/profile', '/stream']

// Маршруты, доступные только неаутентифицированным пользователям
const authRoutes = ['/auth/login']

// Публичные маршруты, доступные всем
const publicRoutes = ['/', '/auth/callback']

// Админские маршруты
const adminRoutes = ['/admin']
// Публичные админские маршруты (не требуют аутентификации)
const publicAdminRoutes = ['/admin/login']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request)
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { pathname } = request.nextUrl

  // Пропускаем статические файлы и API маршруты
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const isAuthenticated = !!session?.user
  const isAdmin = isAdminAuthenticated(request)

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isPublicAdminRoute = publicAdminRoutes.some(route => pathname.startsWith(route))

  // Если админ авторизован, предоставляем доступ ко всем страницам (кроме проверки админских маршрутов)
  if (isAdmin) {
    // Логика для админских маршрутов
    if (isAdminRoute && !isPublicAdminRoute) {
      return response // админ уже авторизован
    }
    return response
  }

  // Логика для админских маршрутов (если админ не авторизован)
  if (isAdminRoute && !isPublicAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Если пользователь не аутентифицирован и не админ, и пытается получить доступ к защищенному маршруту
  if (!isAuthenticated && !isAdmin && isProtectedRoute) {
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