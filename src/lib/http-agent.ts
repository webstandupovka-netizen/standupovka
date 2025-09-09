// lib/http-agent.ts
import { config } from './config'

// Интерфейс для настроек прокси
interface ProxyConfig {
  url: string
  enabled: boolean
}

// Создание fetch с поддержкой прокси
export const createProxyFetch = (proxyConfig?: ProxyConfig) => {
  const shouldUseProxy = proxyConfig?.enabled && proxyConfig?.url
  
  // Логирование для диагностики
  console.log('🔧 Proxy configuration:', {
    enabled: proxyConfig?.enabled,
    hasUrl: !!proxyConfig?.url,
    shouldUseProxy,
    nodeEnv: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  })
  
  if (!shouldUseProxy) {
    console.log('📡 Using standard fetch (no proxy)')
    return fetch
  }
  
  console.log('🔄 Using proxy fetch with URL:', proxyConfig.url)

  // Для Node.js окружения (серверная сторона)
  if (typeof window === 'undefined') {
    // Используем node-fetch с https-proxy-agent для Node.js
    try {
      const nodeFetch = require('node-fetch')
      const { HttpsProxyAgent } = require('https-proxy-agent')
      const { HttpProxyAgent } = require('http-proxy-agent')
      
      // Определяем тип агента на основе URL прокси
      const proxyUrl = new URL(proxyConfig.url)
      const agent = proxyUrl.protocol === 'https:' 
        ? new HttpsProxyAgent(proxyConfig.url)
        : new HttpProxyAgent(proxyConfig.url)
      
      return async (url: string | URL | Request, init?: RequestInit) => {
        try {
          const options = {
            ...init,
            agent: agent
          }
          
          const response = await nodeFetch(url, options)
          
          // Создаем полностью совместимый Response объект
          const responseObj = {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            url: response.url,
            redirected: response.redirected,
            type: response.type,
            // Методы с правильным контекстом
            json: async () => {
              try {
                return await response.json()
              } catch (error) {
                throw new Error(`Failed to parse JSON: ${error}`)
              }
            },
            text: async () => {
              try {
                return await response.text()
              } catch (error) {
                throw new Error(`Failed to get text: ${error}`)
              }
            },
            blob: async () => {
              try {
                return await response.blob()
              } catch (error) {
                throw new Error(`Failed to get blob: ${error}`)
              }
            },
            arrayBuffer: async () => {
              try {
                return await response.arrayBuffer()
              } catch (error) {
                throw new Error(`Failed to get arrayBuffer: ${error}`)
              }
            },
            clone: () => {
              try {
                return response.clone()
              } catch (error) {
                throw new Error(`Failed to clone response: ${error}`)
              }
            }
          }
          
          return responseObj as Response
        } catch (error) {
          console.error('Proxy fetch error:', error)
          throw error
        }
      }
    } catch (error) {
      console.warn('node-fetch or proxy agents not available, falling back to native fetch')
      return fetch
    }
  }
  
  // Для браузера прокси не поддерживается напрямую
  console.warn('Proxy configuration is not supported in browser environment')
  return fetch
}

// Экспорт настроенного fetch для MAIB API
export const maibFetch = createProxyFetch(config.proxy)

// Утилита для создания fetch с кастомными настройками прокси
export const createCustomProxyFetch = (proxyUrl: string) => {
  return createProxyFetch({
    url: proxyUrl,
    enabled: true
  })
}

// Проверка доступности прокси
export const testProxyConnection = async (proxyUrl: string): Promise<boolean> => {
  try {
    const testFetch = createCustomProxyFetch(proxyUrl)
    const response = await testFetch('http://welcome.usefixie.com', {
      method: 'GET'
    })
    return response.ok
  } catch (error) {
    console.error('Proxy connection test failed:', error)
    return false
  }
}