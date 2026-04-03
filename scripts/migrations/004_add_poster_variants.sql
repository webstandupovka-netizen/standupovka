-- Migration: Add poster variants for different contexts
-- Run this in Supabase SQL Editor

ALTER TABLE stream_settings ADD COLUMN IF NOT EXISTS poster_square_url text;
ALTER TABLE stream_settings ADD COLUMN IF NOT EXISTS poster_card_url text;

COMMENT ON COLUMN stream_settings.poster_url IS 'Wide poster for hero section background';
COMMENT ON COLUMN stream_settings.poster_square_url IS 'Square poster for buy page';
COMMENT ON COLUMN stream_settings.poster_card_url IS 'Vertical 3:4 poster for archive cards';
