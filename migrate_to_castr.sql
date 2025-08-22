-- Миграция с Dacast на Castr
-- Добавляем новые поля для Castr
ALTER TABLE public.stream_settings 
ADD COLUMN IF NOT EXISTS castr_stream_id TEXT,
ADD COLUMN IF NOT EXISTS castr_embed_url TEXT,
ADD COLUMN IF NOT EXISTS castr_rtmp_url TEXT,
ADD COLUMN IF NOT EXISTS castr_stream_key TEXT,
ADD COLUMN IF NOT EXISTS castr_playback_url TEXT;

-- Можно оставить старые поля Dacast для совместимости
-- или удалить их позже после полного перехода
-- ALTER TABLE public.stream_settings 
-- DROP COLUMN IF EXISTS dacast_content_id,
-- DROP COLUMN IF EXISTS dacast_embed_url,
-- DROP COLUMN IF EXISTS dacast_rtmp_url,
-- DROP COLUMN IF EXISTS dacast_stream_key;

-- Обновляем существующие записи (если нужно)
-- UPDATE public.stream_settings 
-- SET castr_stream_id = NULL, 
--     castr_embed_url = NULL,
--     castr_rtmp_url = NULL,
--     castr_stream_key = NULL,
--     castr_playback_url = NULL
-- WHERE id IS NOT NULL;

COMMIT;