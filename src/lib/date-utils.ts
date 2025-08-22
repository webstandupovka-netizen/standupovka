import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  parseISO,
  isValid,
} from 'date-fns'
import { ru } from 'date-fns/locale'

// Форматирование даты для отображения
export const formatDate = (date: Date | string, pattern: string = 'dd.MM.yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Некорректная дата'
  return format(dateObj, pattern, { locale: ru })
}

// Форматирование времени
export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm')
}

// Форматирование даты и времени
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd.MM.yyyy HH:mm')
}

// Относительное время ("2 часа назад")
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Некорректная дата'
  
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ru,
  })
}

// Умное форматирование даты
export const formatSmartDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return 'Некорректная дата'
  
  if (isToday(dateObj)) {
    return `Сегодня, ${formatTime(dateObj)}`
  }
  
  if (isTomorrow(dateObj)) {
    return `Завтра, ${formatTime(dateObj)}`
  }
  
  if (isYesterday(dateObj)) {
    return `Вчера, ${formatTime(dateObj)}`
  }
  
  // Если дата в пределах недели, показываем день недели
  const daysDiff = Math.abs(Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
  if (daysDiff <= 7) {
    return format(dateObj, 'EEEE, HH:mm', { locale: ru })
  }
  
  return formatDateTime(dateObj)
}

// Получить начало дня
export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return startOfDay(dateObj)
}

// Получить конец дня
export const getEndOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return endOfDay(dateObj)
}

// Добавить дни
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return addDays(dateObj, days)
}

// Вычесть дни
export const subtractDaysFromDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return subDays(dateObj, days)
}

// Проверить, является ли дата сегодняшней
export const isDateToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isValid(dateObj) && isToday(dateObj)
}

// Проверить, является ли дата завтрашней
export const isDateTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isValid(dateObj) && isTomorrow(dateObj)
}

// Проверить, является ли дата вчерашней
export const isDateYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isValid(dateObj) && isYesterday(dateObj)
}

// Получить диапазон дат для календаря
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = []
  let currentDate = startOfDay(startDate)
  const end = startOfDay(endDate)
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate))
    currentDate = addDays(currentDate, 1)
  }
  
  return dates
}