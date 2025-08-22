'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'
import { StreamManager } from '@/components/admin/stream-manager'
import { RefundPayment } from '@/components/admin/refund-payment'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type Payment = Database['public']['Tables']['payments']['Row']
type EmailLog = Database['public']['Tables']['email_logs']['Row']

interface UserWithStats extends UserProfile {
  payments: Payment[]
  email_logs: EmailLog[]
  total_spent: number
  last_payment_date: string | null
  has_stream_access: boolean
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'stream'>('users')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalPayments: 0
  })

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'DELETE',
      credentials: 'include'
    })
    router.push('/admin/login')
  }

  useEffect(() => {
    checkAuth()
    fetchUsers()
  }, [])

  const checkAuth = async () => {
    // Проверяем JWT токен админа
    const response = await fetch('/api/admin/verify', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      router.push('/admin/login')
      return
    }

    const { admin } = await response.json()
    setUser(admin)
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Получаем пользователей через API
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { users: processedUsers } = await response.json()
      setUsers(processedUsers)

      // Вычисляем общую статистику
      const totalRevenue = processedUsers.reduce((sum: number, user: UserWithStats) => sum + user.total_spent, 0)
      const activeUsers = processedUsers.filter((user: UserWithStats) => user.has_stream_access).length
      const totalPayments = processedUsers.reduce((sum: number, user: UserWithStats) => 
        sum + user.payments.filter((p: any) => p.status === 'completed').length, 0
      )

      setStats({
        totalUsers: processedUsers.length,
        totalRevenue,
        activeUsers,
        totalPayments
      })

    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'MDL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Se încarcă...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Админ панель</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Выйти
            </button>
          </div>
          <p className="text-gray-400">Управление пользователями и платежами</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Пользователи
              </button>
              <button
                onClick={() => setActiveTab('stream')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stream'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                Управление стримом
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'users' && (
          <>
            {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Всего пользователей</h3>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Активные пользователи</h3>
            <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Общий доход</h3>
            <p className="text-3xl font-bold text-blue-400">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Всего платежей</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.totalPayments}</p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Обновить
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Потрачено
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Последний платеж
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.full_name || 'Не указано'}
                        </div>
                        <div className="text-sm text-gray-400">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.has_stream_access 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.has_stream_access ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(user.total_spent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.last_payment_date ? formatDate(user.last_payment_date) : 'Нет платежей'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowUserModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {activeTab === 'stream' && (
          <StreamManager streamId="550e8400-e29b-41d4-a716-446655440000" />
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
            fetchUsers() // Обновляем данные при закрытии модала
          }}
          onRefresh={fetchUsers}
        />
      )}
    </div>
  )
}

// User Details Modal Component
function UserDetailsModal({ 
  user, 
  onClose, 
  onRefresh 
}: { 
  user: UserWithStats
  onClose: () => void
  onRefresh: () => void
}) {
  const [freeAccess, setFreeAccess] = useState(user.free_access || false)
  const [updating, setUpdating] = useState(false)

  // Обновляем состояние при изменении пропса user
  useEffect(() => {
    setFreeAccess(user.free_access || false)
  }, [user.free_access])

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const updateFreeAccess = async (newValue: boolean) => {
    // Оптимистичное обновление - сразу обновляем UI
    setFreeAccess(newValue)
    setUpdating(true)
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ free_access: newValue }),
        credentials: 'include'
      })

      if (response.ok) {
        // Не вызываем onRefresh сразу, чтобы не перезаписать оптимистичное обновление
        // onRefresh будет вызван при закрытии модального окна
        console.log('Free access updated successfully')
      } else {
        // Если ошибка, возвращаем предыдущее состояние
        setFreeAccess(!newValue)
        const errorData = await response.text()
        console.error('Failed to update free access:', response.status, errorData)
      }
    } catch (error) {
      // Если ошибка, возвращаем предыдущее состояние
      setFreeAccess(!newValue)
      console.error('Error updating free access:', error)
    } finally {
      setUpdating(false)
    }
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'MDL'
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Детали пользователя</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Информация о пользователе</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Имя</label>
                <p className="text-white">{user.full_name || 'Не указано'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Роль</label>
                <p className="text-white">user</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Дата регистрации</label>
                <p className="text-white">{formatDate(user.created_at)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freeAccess}
                    onChange={(e) => updateFreeAccess(e.target.checked)}
                    disabled={updating}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-white font-medium">
                    Бесплатный доступ к стриму
                    {updating && <span className="ml-2 text-gray-400">(обновляется...)</span>}
                  </span>
                </label>
                <p className="text-sm text-gray-400 mt-1">
                  Предоставить пользователю бесплатный доступ к стриму без необходимости оплаты
                </p>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">История платежей</h3>
            {user.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-gray-800 rounded-lg">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-2 text-left text-gray-300">Дата</th>
                      <th className="px-4 py-2 text-left text-gray-300">Сумма</th>
                      <th className="px-4 py-2 text-left text-gray-300">Статус</th>
                      <th className="px-4 py-2 text-left text-gray-300">Order ID</th>
                      <th className="px-4 py-2 text-left text-gray-300">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-700">
                        <td className="px-4 py-2 text-gray-300">{formatDate(payment.created_at)}</td>
                        <td className="px-4 py-2 text-gray-300">{formatCurrency(payment.amount || 0)}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            payment.status === 'completed' ? 'bg-green-600 text-white' :
                            payment.status === 'pending' ? 'bg-yellow-600 text-white' :
                            payment.status === 'refunded' ? 'bg-blue-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {payment.status === 'refunded' ? 'возвращен' :
                             payment.status === 'completed' && payment.metadata?.refund_status === 'partially_refunded' ? 'частично возвращен' :
                             payment.status === 'completed' ? 'завершен' :
                             payment.status === 'pending' ? 'ожидает' :
                             payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-300 font-mono text-sm">
                          {payment.maib_order_id || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          <RefundPayment 
                            payment={{
                              id: payment.id,
                              amount: payment.amount,
                              currency: payment.currency,
                              maib_order_id: payment.maib_order_id,
                              status: payment.status,
                              metadata: payment.metadata
                            }} 
                            onRefundComplete={onRefresh}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">Нет платежей</p>
            )}
          </div>

          {/* Email Logs */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">История email уведомлений</h3>
            {user.email_logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-gray-800 rounded-lg">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-2 text-left text-gray-300">Дата</th>
                      <th className="px-4 py-2 text-left text-gray-300">Тип</th>
                      <th className="px-4 py-2 text-left text-gray-300">Тема</th>
                      <th className="px-4 py-2 text-left text-gray-300">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.email_logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-700">
                        <td className="px-4 py-2 text-gray-300">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-2 text-gray-300">{log.email_type}</td>
                        <td className="px-4 py-2 text-gray-300">{log.subject || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.status === 'sent' ? 'bg-green-600 text-white' :
                            log.status === 'delivered' ? 'bg-blue-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">Нет email уведомлений</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}