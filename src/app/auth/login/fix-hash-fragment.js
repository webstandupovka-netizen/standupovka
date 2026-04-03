// Исправление: некоторые email-клиенты передают auth-данные через hash fragment
// Этот скрипт переносит их в query params для обработки на сервере
if (typeof window !== 'undefined' && window.location.hash) {
  try {
    const hash = window.location.hash.substring(1)
    const params = {}
    hash.split('&').forEach(part => {
      const [key, value] = part.split('=')
      if (key && value) params[key] = decodeURIComponent(value)
    })

    if (params.access_token || params.token_hash) {
      const url = new URL(window.location.href.split('#')[0].replace('/auth/login', '/auth/callback'))
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
      window.location.replace(url.toString())
    }
  } catch (e) {
    // ignore
  }
}
