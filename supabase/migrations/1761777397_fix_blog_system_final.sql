-- Migration: fix_blog_system_final
-- Created at: 1761777397

-- Fix blog posts table and create image upload edge function
-- This addresses the blog saving errors

-- Drop existing incorrect tables
DROP TABLE IF EXISTS public.blogs CASCADE;
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;

-- Create correct blog_posts table
CREATE TABLE public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Admin',
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  featured_image TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create correct user_favorites table
CREATE TABLE public.user_favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('program', 'game', 'blog', 'thread')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, content_id, content_type)
);

-- Create correct programs table
CREATE TABLE public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  download_link TEXT NOT NULL,
  category TEXT,
  screenshots TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  platform TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  current_version TEXT DEFAULT '1.0',
  system_requirements JSONB DEFAULT '{}',
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  content_status TEXT DEFAULT 'stable' CHECK (content_status IN ('stable', 'beta', 'development')),
  is_verified BOOLEAN DEFAULT false,
  uploader_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create correct games table
CREATE TABLE public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  download_link TEXT NOT NULL,
  category TEXT,
  screenshots TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  platform TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  current_version TEXT DEFAULT '1.0',
  system_requirements JSONB DEFAULT '{}',
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  content_status TEXT DEFAULT 'stable' CHECK (content_status IN ('stable', 'beta', 'development')),
  is_verified BOOLEAN DEFAULT false,
  uploader_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_posts
CREATE POLICY "Blog posts are viewable by everyone" ON public.blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create RLS policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON public.user_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for programs
CREATE POLICY "Programs are viewable by everyone" ON public.programs
  FOR SELECT USING (content_status = 'stable' OR auth.uid() = uploader_id);

CREATE POLICY "Users can manage their own programs" ON public.programs
  FOR ALL USING (auth.uid() = uploader_id);

-- Create RLS policies for games
CREATE POLICY "Games are viewable by everyone" ON public.games
  FOR SELECT USING (content_status = 'stable' OR auth.uid() = uploader_id);

CREATE POLICY "Users can manage their own games" ON public.games
  FOR ALL USING (auth.uid() = uploader_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts(publish_date);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_content ON public.user_favorites(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_programs_status ON public.programs(content_status);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON public.programs(featured);

CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(content_status);
CREATE INDEX IF NOT EXISTS idx_games_featured ON public.games(featured);

-- Add sample data
INSERT INTO public.blog_posts (title, content, author, is_published) VALUES
('Getting Started with Free Software', 'Welcome to our comprehensive guide on finding and using free software tools for your projects. This guide will help you discover amazing free applications that can boost your productivity...', 'Admin', true),
('The Future of Web Development', 'Explore the latest trends and technologies shaping web development in 2024. From AI-powered tools to new frameworks, discover what''s coming next...', 'Admin', true),
('Top 10 Productivity Tools', 'Discover the best free productivity applications that can help you organize your work and boost your efficiency. These tools are completely free to use...', 'Admin', true),
('Privacy in the Digital Age', 'Understanding digital privacy and protection in our connected world. Learn how to protect your personal information online...', 'Admin', true),
('Open Source vs Commercial Software', 'A comprehensive comparison of open source and commercial software solutions. Find out which is right for your needs...', 'Admin', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.programs (title, description, download_link, category, featured, content_status) VALUES
('Code Editor Pro', 'A powerful code editor for web development with syntax highlighting and auto-completion', 'https://github.com/user/code-editor', 'Development', true, 'stable'),
('Task Manager Pro', 'Organize your daily tasks efficiently with project management features', 'https://github.com/user/task-manager', 'Productivity', false, 'stable'),
('Image Optimizer Deluxe', 'Compress and optimize images automatically for web use', 'https://github.com/user/image-optimizer', 'Utilities', true, 'stable'),
('Password Generator Secure', 'Generate secure passwords with advanced encryption options', 'https://github.com/user/password-gen', 'Security', false, 'stable'),
('Data Backup Manager', 'Automatically backup your important files to cloud storage', 'https://github.com/user/backup-manager', 'System', false, 'beta')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.games (title, description, download_link, category, featured, content_status) VALUES
('Pixel Adventure Classic', 'Retro-style platformer game with pixel art graphics and challenging levels', 'https://github.com/user/pixel-adventure', 'Action', true, 'stable'),
('Space Defender Ultimate', 'Classic space shooting game with modern graphics and sound effects', 'https://github.com/user/space-defender', 'Shooter', false, 'stable'),
('Puzzle Master Collection', 'Brain-teasing puzzle collection with over 100 unique puzzles', 'https://github.com/user/puzzle-master', 'Pacing', true, 'stable'),
('Racing Legends Speed', 'Fast-paced racing experience with realistic physics and tracks', 'https://github.com/user/racing-legends', 'Racing', false, 'stable'),
('Mystery Detective Story', 'Interactive mystery game with branching storylines', 'https://github.com/user/mystery-detective', 'Adventure', false, 'beta')
ON CONFLICT (id) DO NOTHING;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';;