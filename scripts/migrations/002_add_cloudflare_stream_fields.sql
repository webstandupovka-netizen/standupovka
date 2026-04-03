-- Migration: Add Cloudflare Stream fields to stream_settings
-- Run this in Supabase SQL Editor

ALTER TABLE stream_settings ADD COLUMN IF NOT EXISTS cf_input_id text;
ALTER TABLE stream_settings ADD COLUMN IF NOT EXISTS cf_video_id text;

COMMENT ON COLUMN stream_settings.cf_input_id IS 'Cloudflare Stream Live Input ID';
COMMENT ON COLUMN stream_settings.cf_video_id IS 'Cloudflare Stream Video ID (for VOD/recording playback)';
