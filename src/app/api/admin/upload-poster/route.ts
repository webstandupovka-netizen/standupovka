import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth/admin-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || 'image/jpeg'
    const filename = request.headers.get('x-filename') || 'poster.jpg'

    // Генерируем уникальное имя файла
    const ext = filename.split('.').pop() || 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const body = await request.arrayBuffer()
    const buffer = Buffer.from(body)

    // Загружаем в Supabase Storage
    const { data, error } = await supabaseAdmin
      .storage
      .from('posters')
      .upload(uniqueName, buffer, {
        contentType,
        cacheControl: '31536000', // 1 год кэш
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
    }

    // Получаем публичный URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('posters')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload poster error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
