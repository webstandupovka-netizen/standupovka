import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminFromRequest } from '@/lib/auth/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

console.log('Supabase client initialized:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
})

export async function GET(request: NextRequest) {
  try {
    // Проверяем аутентификацию админа
    const admin = getAdminFromRequest(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Admin authenticated:', admin)

    // Получаем всех пользователей
    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      )
    }

    // Получаем все платежи
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json(
        { error: 'Failed to fetch payments', details: paymentsError.message },
        { status: 500 }
      )
    }

    // Получаем все email логи
    const { data: emailLogsData, error: emailLogsError } = await supabase
      .from('email_logs')
      .select('*')

    if (emailLogsError) {
      console.error('Error fetching email logs:', emailLogsError)
      return NextResponse.json(
        { error: 'Failed to fetch email logs', details: emailLogsError.message },
        { status: 500 }
      )
    }

    console.log('Data fetched successfully:', {
      users: usersData?.length || 0,
      payments: paymentsData?.length || 0,
      emailLogs: emailLogsData?.length || 0
    })

    // Обрабатываем данные и добавляем статистику
    const processedUsers = usersData.map((user: any) => {
      // Находим платежи для этого пользователя
      const userPayments = paymentsData?.filter((p: any) => p.user_id === user.id) || []
      const completedPayments = userPayments.filter((p: any) => p.status === 'completed')
      const totalSpent = completedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
      const lastPayment = completedPayments.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      
      // Находим email логи для этого пользователя
      const userEmailLogs = emailLogsData?.filter((e: any) => e.user_id === user.id) || []
      
      return {
        ...user,
        payments: userPayments,
        email_logs: userEmailLogs,
        total_spent: totalSpent,
        last_payment_date: lastPayment?.created_at || null,
        has_stream_access: completedPayments.length > 0
      }
    })

    return NextResponse.json({ users: processedUsers })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}