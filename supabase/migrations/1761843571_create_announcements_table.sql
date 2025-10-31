-- Migration: create_announcements_table
-- Created at: 1761843571

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_enabled BOOLEAN DEFAULT false,
  show_icon BOOLEAN DEFAULT true,
  is_dismissible BOOLEAN DEFAULT true,
  link_url TEXT,
  link_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public can view enabled announcements
CREATE POLICY "Public can view enabled announcements"
  ON announcements
  FOR SELECT
  USING (is_enabled = true);

-- Authenticated users (admins) can manage all announcements
CREATE POLICY "Admins can manage announcements"
  ON announcements
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_announcements_enabled ON announcements(is_enabled);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);;