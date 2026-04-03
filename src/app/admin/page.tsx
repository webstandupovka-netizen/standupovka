'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'
import { EventEditor } from '@/components/admin/event-editor'
import { RefundPayment } from '@/components/admin/refund-payment'
import { Plus, Calendar, Video } from 'lucide-react'

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
          <StreamManagerList />
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

// Stream Manager List — список всех событий + создание нового
function StreamManagerList() {
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('19:30')
  const [newPrice, setNewPrice] = useState('300')
  const [newPosterUrl, setNewPosterUrl] = useState('')
  const [uploadingPoster, setUploadingPoster] = useState(false)

  useEffect(() => {
    fetchStreams()
  }, [])

  const fetchStreams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/streams', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setStreams(data.streams || [])
      }
    } catch (error) {
      console.error('Error fetching streams:', error)
    } finally {
      setLoading(false)
    }
  }

  const createStream = async () => {
    if (!newTitle || !newDate) return

    try {
      setCreating(true)
      const streamStartTime = new Date(`${newDate}T${newTime}:00+03:00`).toISOString()

      const response = await fetch('/api/admin/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          stream_start_time: streamStartTime,
          price: parseFloat(newPrice),
          currency: 'MDL',
          is_active: true,
          is_live: false,
          poster_url: newPosterUrl || null
        })
      })

      if (response.ok) {
        setNewTitle('')
        setNewDescription('')
        setNewDate('')
        setNewPrice('300')
        await fetchStreams()
      }
    } catch (error) {
      console.error('Error creating stream:', error)
    } finally {
      setCreating(false)
    }
  }

  if (selectedStreamId) {
    return (
      <div>
        <EventEditor streamId={selectedStreamId} onBack={() => { setSelectedStreamId(null); fetchStreams() }} />
      </div>
    )
  }

  if (loading) {
    return <div className="text-white text-center py-8">Загрузка событий...</div>
  }

  return (
    <div className="space-y-6">
      {/* Создание нового события */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Создать новое событие
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Название</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Așa, bună seara! - Partea 2"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Описание</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descrierea evenimentului..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Постер события</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadingPoster(true)
                  try {
                    const res = await fetch('/api/admin/upload-poster', {
                      method: 'POST',
                      headers: { 'Content-Type': file.type, 'X-Filename': file.name },
                      body: file,
                      credentials: 'include'
                    })
                    const data = await res.json()
                    if (data.url) setNewPosterUrl(data.url)
                  } catch (err) {
                    console.error('Upload error:', err)
                  } finally {
                    setUploadingPoster(false)
                  }
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-sm file:cursor-pointer"
              />
              {uploadingPoster && <span className="text-blue-400 text-sm">Загрузка...</span>}
            </div>
            {newPosterUrl && (
              <div className="mt-2 flex items-center gap-3">
                <img src={newPosterUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                <span className="text-xs text-gray-400 truncate">{newPosterUrl}</span>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Дата</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Время</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Цена (MDL)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <button
          onClick={createStream}
          disabled={creating || !newTitle || !newDate}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {creating ? 'Создание...' : 'Создать событие'}
        </button>
      </div>

      {/* Список событий */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Все события ({streams.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-800">
          {streams.map((stream) => (
            <div
              key={stream.id}
              className="p-4 hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-between"
              onClick={() => setSelectedStreamId(stream.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {stream.poster_url ? (
                    <img src={stream.poster_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Video className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-white font-medium">{stream.title}</h4>
                  <p className="text-gray-400 text-sm">
                    {new Date(stream.stream_start_time).toLocaleDateString('ro-RO', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${stream.is_live ? 'bg-red-600 text-white' : stream.is_active ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                      {stream.is_live ? 'LIVE' : stream.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                    {(stream.cf_video_id || stream.recorded_video_url) && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-600/20 text-blue-400">Înregistrare</span>
                    )}
                    <span className="text-xs text-gray-500">{stream.price} {stream.currency}</span>
                  </div>
                </div>
              </div>
              <span className="text-gray-500 text-sm">→</span>
            </div>
          ))}
          {streams.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Нет событий. Создайте первое выше.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}