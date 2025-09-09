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
  
  if (!shouldUseProxy) {
    // Возвращаем стандартный fetch если прокси не нужен
    return fetch
  }

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
      
      return async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const options = {
          ...init,
          agent: agent
        }
        
        return nodeFetch(url, options)
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