import { create } from 'zustand'

// Типы для состояния пользователя
interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

// Типы для темы
type Theme = 'light' | 'dark' | 'system'

// Интерфейс состояния приложения
interface AppState {
  // Пользователь
  user: User | null
  isAuthenticated: boolean
  
  // Тема
  theme: Theme
  
  // UI состояние
  sidebarOpen: boolean
  loading: boolean
  
  // Действия
  setUser: (user: User | null) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

// Создание store
export const useAppStore = create<AppState>((set) => ({
  // Начальное состояние
  user: null,
  isAuthenticated: false,
  theme: 'system',
  sidebarOpen: false,
  loading: false,
  
  // Действия
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))

// Селекторы для оптимизации ре-рендеров
export const useUser = () => useAppStore((state) => state.user)
export const useTheme = () => useAppStore((state) => state.theme)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useLoading = () => useAppStore((state) => state.loading)