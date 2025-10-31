-- Migration: add_file_size_to_hero_media
-- Created at: 1761767573

-- Add file_size column to hero_media table
ALTER TABLE hero_media ADD COLUMN file_size INTEGER;;