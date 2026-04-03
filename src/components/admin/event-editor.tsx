'use client'

import { useState, useEffect } from 'react'
import { Save, Trash2, Eye, Radio, Upload, ArrowLeft } from 'lucide-react'

interface EventData {
  id: string
  title: string
  description: string
  poster_url?: string
  stream_start_time: string
  stream_end_time?: string
  price: number
  currency: string
  is_live: boolean
  is_active: boolean
  cf_input_id?: string
  cf_video_id?: string
  recorded_video_url?: string
  castr_playback_url?: string
}

interface EventEditorProps {
  streamId: string
  onBack: () => void
}

export function EventEditor({ streamId, onBack }: EventEditorProps) {
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)

  // Editable fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [posterSquareUrl, setPosterSquareUrl] = useState('')
  const [posterCardUrl, setPosterCardUrl] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('MDL')
  const [isLive, setIsLive] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [cfInputId, setCfInputId] = useState('')
  const [cfVideoId, setCfVideoId] = useState('')
  const [recordedVideoUrl, setRecordedVideoUrl] = useState('')

  useEffect(() => {
    fetchEvent()
  }, [streamId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/stream/${streamId}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setEvent(data)

      // Populate fields
      setTitle(data.title || '')
      setDescription(data.description || '')
      setPosterUrl(data.poster_url || '')
      setPosterSquareUrl(data.poster_square_url || '')
      setPosterCardUrl(data.poster_card_url || '')
      setPrice(String(data.price || 300))
      setCurrency(data.currency || 'MDL')
      setIsLive(data.is_live || false)
      setIsActive(data.is_active ?? true)
      setCfInputId(data.cf_input_id || '')
      setCfVideoId(data.cf_video_id || '')
      setRecordedVideoUrl(data.recorded_video_url || '')

      // Parse date/time from ISO
      if (data.stream_start_time) {
        const d = new Date(data.stream_start_time)
        setStartDate(d.toISOString().split('T')[0])
        setStartTime(d.toTimeString().slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEvent = async () => {
    try {
      setSaving(true)
      setSaved(false)

      const streamStartTime = startDate && startTime
        ? new Date(`${startDate}T${startTime}:00+03:00`).toISOString()
        : undefined

      const res = await fetch(`/api/admin/stream/${streamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          poster_url: posterUrl || null,
          poster_square_url: posterSquareUrl || null,
          poster_card_url: posterCardUrl || null,
          stream_start_time: streamStartTime,
          price: parseFloat(price),
          currency,
          is_live: isLive,
          is_active: isActive,
          cf_input_id: cfInputId || null,
          cf_video_id: cfVideoId || null,
          recorded_video_url: recordedVideoUrl || null,
        })
      })

      if (!res.ok) throw new Error('Failed to save')
      const updated = await res.json()
      setEvent(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async () => {
    if (!confirm('Вы уверены? Событие будет деактивировано.')) return

    try {
      setDeleting(true)
      await fetch(`/api/admin/stream/${streamId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      onBack()
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setDeleting(false)
    }
  }

  const uploadPoster = async (file: File) => {
    setUploadingPoster(true)
    try {
      const res = await fetch('/api/admin/upload-poster', {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'X-Filename': file.name },
        body: file,
        credentials: 'include'
      })
      const data = await res.json()
      if (data.url) setPosterUrl(data.url)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploadingPoster(false)
    }
  }

  if (loading) {
    return <div className="text-white text-center py-12">Загрузка события...</div>
  }

  if (!event) {
    return <div className="text-red-400 text-center py-12">Событие не найдено</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад к списку
        </button>
        <div className="flex items-center gap-2">
          {saved && <span className="text-green-400 text-sm">Сохранено!</span>}
          <button
            onClick={deleteEvent}
            disabled={deleting}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? '...' : 'Удалить'}
          </button>
        </div>
      </div>

      {/* Основная информация */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-5">
        <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-3">Основная информация</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Название</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Дата</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Время</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Цена</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Валюта</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="MDL">MDL</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Постеры */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-6">
        <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-3">Постеры</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hero — wide */}
          <PosterUpload
            label="Hero (широкий)"
            hint="Фон главной страницы, 16:9"
            value={posterUrl}
            onChange={setPosterUrl}
            onUpload={uploadPoster}
            uploading={uploadingPoster}
            previewClass="aspect-video"
          />

          {/* Buy — square */}
          <PosterUpload
            label="Покупка (квадрат)"
            hint="Страница оплаты, 1:1"
            value={posterSquareUrl}
            onChange={setPosterSquareUrl}
            onUpload={uploadPoster}
            uploading={uploadingPoster}
            previewClass="aspect-square"
          />

          {/* Card — vertical */}
          <PosterUpload
            label="Карточка (вертик.)"
            hint="Архив записей, 3:4"
            value={posterCardUrl}
            onChange={setPosterCardUrl}
            onUpload={uploadPoster}
            uploading={uploadingPoster}
            previewClass="aspect-[3/4]"
          />
        </div>
      </div>

      {/* Статусы */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-3">Статус</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between bg-gray-800 p-4 rounded-lg cursor-pointer">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Radio className="h-4 w-4" />
                LIVE
              </p>
              <p className="text-gray-400 text-sm">Трансляция идёт в прямом эфире</p>
            </div>
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="h-5 w-5 accent-red-500"
            />
          </label>

          <label className="flex items-center justify-between bg-gray-800 p-4 rounded-lg cursor-pointer">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Активно
              </p>
              <p className="text-gray-400 text-sm">Видимо на сайте для пользователей</p>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 accent-green-500"
            />
          </label>
        </div>
      </div>

      {/* Cloudflare Stream */}
      <div className="bg-gray-900 rounded-lg p-6 space-y-4">
        <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-3">Cloudflare Stream</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Live Input ID</label>
            <input
              value={cfInputId}
              onChange={(e) => setCfInputId(e.target.value)}
              placeholder="ID из Cloudflare Dashboard"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Для live-стриминга через OBS</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Video ID (запись)</label>
            <input
              value={cfVideoId}
              onChange={(e) => setCfVideoId(e.target.value)}
              placeholder="Автоматически после стрима"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Для воспроизведения записи (VOD)</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">Прямой URL записи (fallback)</label>
          <input
            value={recordedVideoUrl}
            onChange={(e) => setRecordedVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Используется если нет Cloudflare Video ID</p>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button
          onClick={saveEvent}
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Сохранение...' : saved ? 'Сохранено!' : 'Сохранить изменения'}
        </button>
      </div>
    </div>
  )
}

// Reusable poster upload component
function PosterUpload({
  label, hint, value, onChange, onUpload, uploading, previewClass
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  onUpload: (file: File) => Promise<void>
  uploading: boolean
  previewClass: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-white text-sm font-medium">{label}</p>
      <p className="text-gray-500 text-xs">{hint}</p>

      <div className={`${previewClass} bg-gray-800 rounded-lg overflow-hidden w-full`}>
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Нет фото</div>
        )}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          // Upload and set this specific field
          const res = await fetch('/api/admin/upload-poster', {
            method: 'POST',
            headers: { 'Content-Type': file.type, 'X-Filename': file.name },
            body: file,
            credentials: 'include'
          })
          const data = await res.json()
          if (data.url) onChange(data.url)
        }}
        className="w-full text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white file:text-xs file:cursor-pointer"
      />
    </div>
  )
}
