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
    // Используем https-proxy-agent для Node.js
    const { HttpsProxyAgent } = require('https-proxy-agent')
    const agent = new HttpsProxyAgent(proxyConfig.url)
    
    return (url: string | URL | Request, init?: RequestInit) => {
      const requestInit = {
        ...init,
        // @ts-ignore - Node.js specific property
        agent: agent
      }
      
      return fetch(url, requestInit)
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