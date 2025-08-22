import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminFromRequest } from '@/lib/auth/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем аутентификацию админа
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { data: streamData, error } = await supabase
      .from('stream_settings')
      .select('*')
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
    console.error('Error fetching stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем аутентификацию админа
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    
    // Валидируем входные данные
    const allowedFields = [
      'title',
      'description', 
      'castr_stream_id',
      'castr_embed_url',
      'castr_rtmp_url',
      'castr_stream_key',
      'castr_playback_url',
      'poster_url',
      'stream_start_time',
      'stream_end_time',
      'is_live',
      'is_active',
      'price',
      'currency'
    ]
    
    const updateData: any = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }
    
    // Добавляем timestamp обновления
    updateData.updated_at = new Date().toISOString()

    // Обновляем стрим
    const { data: updatedStream, error } = await supabase
      .from('stream_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating stream:', error)
      return NextResponse.json(
        { error: 'Failed to update stream', details: error.message },
        { status: 500 }
      )
    }

    // Логируем действие админа
    await supabase
      .from('access_logs')
      .insert({
        action: 'admin_stream_update',
        resource: `stream:${id}`,
        metadata: {
          admin_id: admin.adminId,
          updated_fields: Object.keys(updateData),
          changes: updateData
        }
      })

    return NextResponse.json(updatedStream)
  } catch (error) {
    console.error('Error updating stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Удаление стрима (только для админов)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем аутентификацию админа
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Мягкое удаление - просто деактивируем стрим
    const { data: deletedStream, error } = await supabase
      .from('stream_settings')
      .update({ 
        is_active: false,
        is_live: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting stream:', error)
      return NextResponse.json(
        { error: 'Failed to delete stream', details: error.message },
        { status: 500 }
      )
    }

    // Логируем действие админа
    await supabase
      .from('access_logs')
      .insert({
        action: 'admin_stream_delete',
        resource: `stream:${id}`,
        metadata: {
          admin_id: admin.adminId
        }
      })

    return NextResponse.json({ message: 'Stream deactivated successfully' })
  } catch (error) {
    console.error('Error deleting stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}