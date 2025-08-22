-- Add free_access field to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS free_access BOOLEAN DEFAULT FALSE;

-- Update existing users to have free_access = false by default
UPDATE user_profiles SET free_access = FALSE WHERE free_access IS NULL;

-- Make the column NOT NULL
ALTER TABLE user_profiles ALTER COLUMN free_access SET NOT NULL;