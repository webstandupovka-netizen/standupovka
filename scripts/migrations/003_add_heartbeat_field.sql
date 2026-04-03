-- Migration: Add heartbeat_at to user_sessions for concurrent session counting
-- Run this in Supabase SQL Editor

ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS heartbeat_at timestamptz DEFAULT now();
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS stream_id uuid;

COMMENT ON COLUMN user_sessions.heartbeat_at IS 'Last heartbeat timestamp - session is alive if < 2 min ago';
COMMENT ON COLUMN user_sessions.stream_id IS 'Which stream this session is watching';

-- Index for fast lookup of active sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_active_heartbeat
ON user_sessions (user_id, is_active, heartbeat_at DESC)
WHERE is_active = true;
