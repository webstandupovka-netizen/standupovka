import crypto from 'crypto'

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN!
const SIGNING_KEY_ID = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID || ''
const SIGNING_KEY_PEM = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_PEM || ''

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`

async function cfFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const json = await res.json()
  if (!json.success) {
    console.error('Cloudflare Stream API error:', json.errors)
    throw new Error(json.errors?.[0]?.message || 'Cloudflare Stream API error')
  }
  return json.result
}

export class CloudflareStreamService {
  /**
   * Создать Live Input (для нового стрима).
   * recording.mode: 'automatic' — запись автоматически после завершения.
   */
  static async createLiveInput(name: string) {
    const result = await cfFetch('/live_inputs', {
      method: 'POST',
      body: JSON.stringify({
        meta: { name },
        recording: { mode: 'automatic' },
      }),
    })

    return {
      inputId: result.uid as string,
      rtmpsUrl: result.rtmps?.url as string,
      rtmpsKey: result.rtmps?.streamKey as string,
      srtUrl: result.srt?.url as string,
    }
  }

  /**
   * Получить список видео (записей) для Live Input.
   */
  static async getRecordings(inputId: string) {
    const result = await cfFetch(`/live_inputs/${inputId}/videos`)
    return (result as any[]).map((v: any) => ({
      videoId: v.uid as string,
      status: v.status?.state as string,
      duration: v.duration as number,
      createdAt: v.created as string,
      readyToStream: v.readyToStream as boolean,
    }))
  }

  /**
   * Получить информацию о видео.
   */
  static async getVideo(videoId: string) {
    const result = await cfFetch(`/${videoId}`)
    return {
      videoId: result.uid as string,
      status: result.status?.state as string,
      duration: result.duration as number,
      readyToStream: result.readyToStream as boolean,
      playback: {
        hls: result.playback?.hls as string,
        dash: result.playback?.dash as string,
      },
      thumbnail: result.thumbnail as string,
    }
  }

  /**
   * Включить signed URLs для видео (нужно сделать один раз).
   */
  static async enableSignedUrls(videoId: string) {
    await cfFetch(`/${videoId}`, {
      method: 'POST',
      body: JSON.stringify({ requireSignedURLs: true }),
    })
  }

  /**
   * Сгенерировать signed token для просмотра видео.
   * Использует RS256 JWT с приватным ключом.
   */
  static createSignedToken(videoId: string, expiresInSeconds: number = 900): string {
    if (!SIGNING_KEY_ID || !SIGNING_KEY_PEM) {
      throw new Error('Cloudflare Stream signing keys not configured')
    }

    const header = {
      alg: 'RS256',
      kid: SIGNING_KEY_ID,
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      sub: videoId,
      kid: SIGNING_KEY_ID,
      exp: now + expiresInSeconds,
      nbf: now - 60,
      accessRules: [
        { type: 'any', action: 'allow' },
      ],
    }

    const encodedHeader = base64url(JSON.stringify(header))
    const encodedPayload = base64url(JSON.stringify(payload))
    const signingInput = `${encodedHeader}.${encodedPayload}`

    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signingInput)
    const signature = sign.sign(SIGNING_KEY_PEM, 'base64url')

    return `${signingInput}.${signature}`
  }

  /**
   * Embed URL для iframe (без подписи — для публичных видео).
   */
  static getEmbedUrl(videoId: string): string {
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN || ''
    return `https://${subdomain}.cloudflarestream.com/${videoId}/iframe`
  }

  /**
   * Embed URL с signed token.
   */
  static getSignedEmbedUrl(token: string): string {
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN || ''
    return `https://${subdomain}.cloudflarestream.com/${token}/iframe`
  }

  /**
   * Загрузить видео по URL (для миграции существующих записей).
   */
  static async uploadFromUrl(videoUrl: string, name: string) {
    const result = await cfFetch('/copy', {
      method: 'POST',
      body: JSON.stringify({
        url: videoUrl,
        meta: { name },
        requireSignedURLs: true,
      }),
    })

    return {
      videoId: result.uid as string,
      status: result.status?.state as string,
    }
  }
}

function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
