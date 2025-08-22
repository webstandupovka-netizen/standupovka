-- Миграция с Vimeo на Dacast
-- Добавляем новые поля для Dacast
ALTER TABLE public.stream_settings 
ADD COLUMN IF NOT EXISTS dacast_content_id TEXT,
ADD COLUMN IF NOT EXISTS dacast_embed_url TEXT,
ADD COLUMN IF NOT EXISTS dacast_rtmp_url TEXT,
ADD COLUMN IF NOT EXISTS dacast_stream_key TEXT;

-- Удаляем старые поля Vimeo (опционально, можно оставить для совместимости)
-- ALTER TABLE public.stream_settings 
-- DROP COLUMN IF EXISTS vimeo_video_id,
-- DROP COLUMN IF EXISTS vimeo_embed_url;

-- Обновляем существующие записи (если нужно)
-- UPDATE public.stream_settings 
-- SET dacast_content_id = NULL, 
--     dacast_embed_url = NULL,
--     dacast_rtmp_url = NULL,
--     dacast_stream_key = NULL
-- WHERE id IS NOT NULL;

COMMIT;