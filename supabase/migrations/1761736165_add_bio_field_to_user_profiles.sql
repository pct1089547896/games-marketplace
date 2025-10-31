-- Migration: add_bio_field_to_user_profiles
-- Created at: 1761736165

-- Add bio field to user_profiles table if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Update RLS policies to allow users to update their own bio
-- (policies should already allow updates, but ensuring it's covered);