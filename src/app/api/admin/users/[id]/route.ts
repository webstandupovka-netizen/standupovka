import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getAdminFromRequest } from '@/lib/auth/admin-auth'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию админа
    const admin = getAdminFromRequest(request)
    
    console.log('Admin auth check:', { hasAdmin: !!admin, adminId: admin?.adminId })

    if (!admin) {
      console.log('Unauthorized: no admin found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { free_access } = body

    // Валидация входных данных
    if (typeof free_access !== 'boolean') {
      return NextResponse.json(
        { error: 'free_access must be a boolean' },
        { status: 400 }
      )
    }

    // Получаем параметры
    const resolvedParams = await params

    // Обновляем пользователя
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ free_access })
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}