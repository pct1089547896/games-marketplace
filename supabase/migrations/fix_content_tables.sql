-- Fix content tables to ensure they exist with correct structure
-- This migration addresses blog posts and content not showing up

-- Ensure programs table exists
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

-- Ensure games table exists
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

-- Create blogs table if it doesn't exist
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
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Create RLS policies for programs
CREATE POLICY "Programs are viewable by everyone" ON public.programs
  FOR SELECT USING (status = 'active' OR auth.uid() = developer_id);

CREATE POLICY "Users can insert their own programs" ON public.programs
  FOR INSERT WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Users can update their own programs" ON public.programs
  FOR UPDATE USING (auth.uid() = developer_id);

CREATE POLICY "Users can delete their own programs" ON public.programs
  FOR DELETE USING (auth.uid() = developer_id);

-- Create RLS policies for games
CREATE POLICY "Games are viewable by everyone" ON public.games
  FOR SELECT USING (status = 'active' OR auth.uid() = developer_id);

CREATE POLICY "Users can insert their own games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Users can update their own games" ON public.games
  FOR UPDATE USING (auth.uid() = developer_id);

CREATE POLICY "Users can delete their own games" ON public.games
  FOR DELETE USING (auth.uid() = developer_id);

-- Create RLS policies for blogs
CREATE POLICY "Blogs are viewable by everyone" ON public.blogs
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Users can insert their own blogs" ON public.blogs
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own blogs" ON public.blogs
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own blogs" ON public.blogs
  FOR DELETE USING (auth.uid() = author_id);

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_programs_status ON public.programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON public.programs(featured);
CREATE INDEX IF NOT EXISTS idx_programs_category ON public.programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_developer ON public.programs(developer_id);

CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_featured ON public.games(featured);
CREATE INDEX IF NOT EXISTS idx_games_genre ON public.games(genre);
CREATE INDEX IF NOT EXISTS idx_games_developer ON public.games(developer_id);

CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON public.blogs(featured);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';