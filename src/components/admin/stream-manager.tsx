'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Play, Square, Settings, Video, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface StreamData {
  id: string
  title: string
  description: string
  castr_stream_id?: string
  castr_embed_url?: string
  castr_rtmp_url?: string
  castr_stream_key?: string
  castr_playback_url?: string
  stream_start_time: string
  stream_end_time?: string
  poster_url?: string
  is_live: boolean
  is_active: boolean
  price: number
  currency: string
}

interface StreamManagerProps {
  streamId: string
}

export function StreamManager({ streamId }: StreamManagerProps) {
  const [stream, setStream] = useState<StreamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [castrStreamId, setCastrStreamId] = useState('live_691333907e6811f09d8453d91b8ad2ad')
  const [castrEmbedUrl, setCastrEmbedUrl] = useState('https://player.castr.com/live_691333907e6811f09d8453d91b8ad2ad')
  const [castrRtmpUrl, setCastrRtmpUrl] = useState('rtmp://fr.castr.io/static')
  const [castrStreamKey, setCastrStreamKey] = useState('live_691333907e6811f09d8453d91b8ad2ad?password=82943a02')
  const [castrPlaybackUrl, setCastrPlaybackUrl] = useState('https://player.castr.com/live_691333907e6811f09d8453d91b8ad2ad')
  const [isLive, setIsLive] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchStreamData()
  }, [streamId])

  const fetchStreamData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stream/${streamId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch stream data')
      }
      const data = await response.json()
      setStream(data)
      setCastrStreamId(data.castr_stream_id || '')
      setCastrEmbedUrl(data.castr_embed_url || '')
      setCastrRtmpUrl(data.castr_rtmp_url || '')
      setCastrStreamKey(data.castr_stream_key || '')
      setCastrPlaybackUrl(data.castr_playback_url || '')
      setIsLive(data.is_live)
      setIsActive(data.is_active)
    } catch (error) {
      console.error('Error fetching stream:', error)
      console.error('Ошибка загрузки данных стрима')
    } finally {
      setLoading(false)
    }
  }

  const updateStreamSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/stream/${streamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          castr_stream_id: castrStreamId || null,
          castr_embed_url: castrEmbedUrl || null,
          castr_rtmp_url: castrRtmpUrl || null,
          castr_stream_key: castrStreamKey || null,
          castr_playback_url: castrPlaybackUrl || null,
          is_live: isLive,
          is_active: isActive,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update stream')
      }

      const updatedStream = await response.json()
      setStream(updatedStream)
      console.log('Настройки стрима обновлены')
    } catch (error) {
      console.error('Error updating stream:', error)
      console.error('Ошибка обновления настроек')
    } finally {
      setSaving(false)
    }
  }

  const generateCastrEmbedUrl = (streamId: string) => {
    if (!streamId) return ''
    return `https://fr.castr.io/static/${streamId}`
  }

  const handleCastrIdChange = (value: string) => {
    setCastrStreamId(value)
    if (value) {
      setCastrEmbedUrl(generateCastrEmbedUrl(value))
    } else {
      setCastrEmbedUrl('')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stream) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Стрим не найден</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Информация о стриме */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {stream.title}
          </CardTitle>
          <CardDescription>
            {stream.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Статус</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isLive ? 'destructive' : 'secondary'}>
                  {isLive ? (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      LIVE
                    </>
                  ) : (
                    <>
                      <Square className="h-3 w-3 mr-1" />
                      Offline
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Активность</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isActive ? 'default' : 'outline'}>
                  {isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Активен
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Неактивен
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Цена</Label>
              <p className="font-medium">{stream.price} {stream.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки Castr */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки Castr Live
          </CardTitle>
          <CardDescription>
            Настройте параметры live трансляции через Castr
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="castr-id">Castr Stream ID</Label>
              <Input
                id="castr-id"
                value={castrStreamId}
                onChange={(e) => handleCastrIdChange(e.target.value)}
                placeholder="Введите Stream ID Castr (например: static)"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Stream ID можно найти в панели управления Castr
              </p>
            </div>

            <div>
              <Label htmlFor="castr-embed">Castr Embed URL</Label>
              <Input
                id="castr-embed"
                value={castrEmbedUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCastrEmbedUrl(e.target.value)}
                placeholder="https://fr.castr.io/static/stream_id"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL автоматически генерируется при вводе Stream ID
              </p>
            </div>

            <div>
              <Label htmlFor="castr-rtmp">RTMP URL</Label>
              <Input
                id="castr-rtmp"
                value={castrRtmpUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCastrRtmpUrl(e.target.value)}
                placeholder="rtmp://fr.castr.io/static"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                RTMP URL для настройки OBS или другого ПО
              </p>
            </div>

            <div>
              <Label htmlFor="castr-key">Stream Key</Label>
              <Input
                id="castr-key"
                value={castrStreamKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCastrStreamKey(e.target.value)}
                placeholder="Введите Stream Key из Castr"
                className="mt-1"
                type="password"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Stream Key для аутентификации трансляции
              </p>
            </div>

            <div>
              <Label htmlFor="castr-playback">Playback URL</Label>
              <Input
                id="castr-playback"
                value={castrPlaybackUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCastrPlaybackUrl(e.target.value)}
                placeholder="https://fr.castr.io/static/stream_id.m3u8"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                HLS Playback URL для воспроизведения стрима
              </p>
            </div>

            {castrEmbedUrl && (
              <div>
                <Label>Предварительный просмотр</Label>
                <div className="mt-2 aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={castrEmbedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Castr Preview"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is-live">Live статус</Label>
                <p className="text-sm text-muted-foreground">
                  Включите, когда трансляция идет в прямом эфире
                </p>
              </div>
              <input
                id="is-live"
                type="checkbox"
                checked={isLive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsLive(e.target.checked)}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is-active">Активность стрима</Label>
                <p className="text-sm text-muted-foreground">
                  Отключите, чтобы скрыть стрим от пользователей
                </p>
              </div>
              <input
                id="is-active"
                type="checkbox"
                checked={isActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={updateStreamSettings}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                'Сохранить настройки'
              )}
            </Button>
            
            {castrStreamId && (
              <Button
                variant="outline"
                onClick={() => window.open(`https://castr.io/`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Открыть Castr
              </Button>
            )}
          </div>
        </CardContent>
      </Card>


    </div>
  )
}