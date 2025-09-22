-- Добавление поля recorded_video_url в таблицу stream_settings
-- Выполните этот SQL скрипт в Supabase Dashboard > SQL Editor

ALTER TABLE stream_settings 
ADD COLUMN IF NOT EXISTS recorded_video_url TEXT;

-- Добавляем комментарий к полю для документации
COMMENT ON COLUMN stream_settings.recorded_video_url IS 'URL YouTube видео для воспроизведения записи стрима';

-- Проверяем, что поле добавлено успешно
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'stream_settings' 
AND column_name = 'recorded_video_url';