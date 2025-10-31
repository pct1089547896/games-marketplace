-- This SQL script will be used to fix the database tables
-- Run this via a migration or directly through Supabase SQL editor

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('program', 'game', 'blog', 'thread')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, content_id, content_type)
);

-- Create programs table  
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  category TEXT,
  tags TEXT[],
  image_url TEXT,
  developer_id UUID REFERENCES auth.users(id),
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  genre TEXT,
  tags TEXT[],
  image_url TEXT,
  developer_id UUID REFERENCES auth.users(id),
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id),
  tags TEXT[],
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

DROP POLICY IF EXISTS "Programs are viewable by everyone" ON public.programs;
DROP POLICY IF EXISTS "Users can insert their own programs" ON public.programs;
DROP POLICY IF EXISTS "Users can update their own programs" ON public.programs;
DROP POLICY IF EXISTS "Users can delete their own programs" ON public.programs;

DROP POLICY IF EXISTS "Games are viewable by everyone" ON public.games;
DROP POLICY IF EXISTS "Users can insert their own games" ON public.games;
DROP POLICY IF EXISTS "Users can update their own games" ON public.games;
DROP POLICY IF EXISTS "Users can delete their own games" ON public.games;

DROP POLICY IF EXISTS "Blogs are viewable by everyone" ON public.blogs;
DROP POLICY IF EXISTS "Users can insert their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Users can update their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Users can delete their own blogs" ON public.blogs;

-- Create new policies
CREATE POLICY "Users can view their own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own favorites" ON public.user_favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Programs are viewable by everyone" ON public.programs FOR SELECT USING (status = 'active' OR auth.uid() = developer_id);
CREATE POLICY "Users can insert their own programs" ON public.programs FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Users can update their own programs" ON public.programs FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Users can delete their own programs" ON public.programs FOR DELETE USING (auth.uid() = developer_id);

CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (status = 'active' OR auth.uid() = developer_id);
CREATE POLICY "Users can insert their own games" ON public.games FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Users can update their own games" ON public.games FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Users can delete their own games" ON public.games FOR DELETE USING (auth.uid() = developer_id);

CREATE POLICY "Blogs are viewable by everyone" ON public.blogs FOR SELECT USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "Users can insert their own blogs" ON public.blogs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update their own blogs" ON public.blogs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete their own blogs" ON public.blogs FOR DELETE USING (auth.uid() = author_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_content ON public.user_favorites(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_programs_status ON public.programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON public.programs(featured);

CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_featured ON public.games(featured);

CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON public.blogs(featured);

-- Add sample data for testing
INSERT INTO public.programs (title, description, category, featured, status) VALUES
('Code Editor Pro', 'A powerful code editor for web development', 'Development', true, 'active'),
('Task Manager', 'Organize your daily tasks efficiently', 'Productivity', false, 'active'),
('Image Optimizer', 'Compress and optimize images automatically', 'Utilities', true, 'active'),
('Password Generator', 'Generate secure passwords with ease', 'Security', false, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.games (title, description, genre, featured, status) VALUES
('Pixel Adventure', 'Retro-style platformer game', 'Action', true, 'active'),
('Space Defender', 'Classic space shooting game', 'Shooter', false, 'active'),
('Puzzle Master', 'Brain-teasing puzzle collection', 'Puzzle', true, 'active'),
('Racing Legends', 'Fast-paced racing experience', 'Racing', false, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blogs (title, content, excerpt, featured, status) VALUES
('Getting Started with Free Software', 'Learn how to find and use free software tools for your projects...', 'A comprehensive guide to free software', true, 'published'),
('The Future of Web Development', 'Explore the latest trends and technologies shaping web development...', 'Web development trends for 2024', false, 'published'),
('Top 10 Productivity Tools', 'Discover the best tools to boost your productivity...', 'Essential productivity applications', true, 'published'),
('Privacy in the Digital Age', 'Understanding digital privacy and protection...', 'How to protect your privacy online', false, 'published')
ON CONFLICT (id) DO NOTHING;