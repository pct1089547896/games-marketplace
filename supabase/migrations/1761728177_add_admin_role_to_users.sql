-- Migration: add_admin_role_to_users
-- Created at: 1761728177


-- Add is_admin column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add account_status column to user_profiles for account management
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Add index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON user_profiles(account_status);
;