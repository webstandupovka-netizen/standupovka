import { NextRequest, NextResponse } from 'next/server'

// GET /preview?key=SECRET → ставит cookie и редиректит на главную
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')

  if (key !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set('preview-access', key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  })

  return response
}
