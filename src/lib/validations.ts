import { z } from 'zod'

// Базовые схемы валидации
export const emailSchema = z.string().email('Некорректный email адрес')
export const passwordSchema = z.string().min(8, 'Пароль должен содержать минимум 8 символов')

// Схема для регистрации
export const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

// Схема для входа
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен'),
})

// Схема для профиля пользователя
export const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: emailSchema,
  bio: z.string().max(500, 'Биография не должна превышать 500 символов').optional(),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Местоположение не должно превышать 100 символов').optional(),
})

// Схема для создания поста/задачи
export const taskSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(200, 'Заголовок не должен превышать 200 символов'),
  description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    message: 'Выберите приоритет',
  }),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
})

// Типы для TypeScript
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type TaskFormData = z.infer<typeof taskSchema>