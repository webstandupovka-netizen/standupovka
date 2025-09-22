import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Функция для проверки админских прав
async function checkAdminAccess(request: NextRequest) {
  // Проверяем admin-token cookie
  const admin = getAdminFromRequest(request)
  
  if (!admin) {
    console.log('Admin access denied: no valid token')
    return false
  }

  // Дополнительно проверяем, что админ активен в базе данных
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('id, is_active')
    .eq('id', admin.adminId)
    .eq('is_active', true)
    .single()

  if (adminError || !adminData) {
    console.log('Admin access denied: admin not found or inactive', adminError)
    return false
  }

  console.log('Admin access granted for:', admin.username)
  return true
}

// Функция для валидации YouTube URL
function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  return youtubeRegex.test(url)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем админские права
    const isAdmin = await checkAdminAccess(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { recorded_video_url } = body

    // Валидация входных данных
    if (!recorded_video_url) {
      return NextResponse.json(
        { error: 'recorded_video_url is required' },
        { status: 400 }
      )
    }

    if (!isValidYouTubeUrl(recorded_video_url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли стрим
    const { data: existingStream, error: fetchError } = await supabase
      .from('stream_settings')
      .select('id, title')
      .eq('id', id)
      .single()

    if (fetchError || !existingStream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    // Обновляем запись стрима с YouTube URL
    const { data: updatedStream, error: updateError } = await supabase
      .from('stream_settings')
      .update({ 
        recorded_video_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating stream:', updateError)
      return NextResponse.json(
        { error: 'Failed to update stream' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Stream video URL updated successfully',
      stream: updatedStream
    })

  } catch (error) {
    console.error('Error in admin video upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Получение текущего URL записи
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем админские права
    const isAdmin = await checkAdminAccess(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    const { data: streamData, error } = await supabase
      .from('stream_settings')
      .select('id, title, recorded_video_url')
      .eq('id', id)
      .single()

    if (error || !streamData) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(streamData)

  } catch (error) {
    console.error('Error fetching stream video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Удаление URL записи
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем админские права
    const isAdmin = await checkAdminAccess(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Удаляем URL записи
    const { data: updatedStream, error: updateError } = await supabase
      .from('stream_settings')
      .update({ 
        recorded_video_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error removing video URL:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove video URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Video URL removed successfully',
      stream: updatedStream
    })

  } catch (error) {
    console.error('Error removing video URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}