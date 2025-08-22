-- Создание таблицы для админов
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Включение RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Политика безопасности: только сервисная роль может работать с админами
CREATE POLICY "Service role can manage admin users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_admin_users_updated_at_trigger
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Создание первого админа (пароль: admin123)
-- Хеш для пароля 'admin123' с bcrypt
INSERT INTO admin_users (username, password_hash, email, full_name)
VALUES (
  'admin',
  '$2b$10$rBV2HQ/qgxqcQTNveVHy4.KTB1YuFJgjYdXrhTKSvGOUGOoSAugXu',
  'admin@standupovka.md',
  'Администратор'
) ON CONFLICT (username) DO NOTHING;