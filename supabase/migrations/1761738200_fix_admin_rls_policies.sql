-- Migration: fix_admin_rls_policies
-- Created at: 1761738200
-- Fix: Allow authenticated users to perform admin operations

-- Drop existing admin policies for games
DROP POLICY IF EXISTS "Allow admin insert games" ON games;
DROP POLICY IF EXISTS "Allow admin update games" ON games;
DROP POLICY IF EXISTS "Allow admin delete games" ON games;

-- Create new policies that include authenticated users
CREATE POLICY "Allow admin insert games" ON games
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin update games" ON games
  FOR UPDATE
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin delete games" ON games
  FOR DELETE
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Drop existing admin policies for programs
DROP POLICY IF EXISTS "Allow admin insert programs" ON programs;
DROP POLICY IF EXISTS "Allow admin update programs" ON programs;
DROP POLICY IF EXISTS "Allow admin delete programs" ON programs;

-- Create new policies that include authenticated users
CREATE POLICY "Allow admin insert programs" ON programs
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin update programs" ON programs
  FOR UPDATE
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin delete programs" ON programs
  FOR DELETE
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Drop existing admin policies for blog posts
DROP POLICY IF EXISTS "Allow admin insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow admin update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow admin delete blog posts" ON blog_posts;

-- Create new policies that include authenticated users
CREATE POLICY "Allow admin insert blog posts" ON blog_posts
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin update blog posts" ON blog_posts
  FOR UPDATE
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin delete blog posts" ON blog_posts
  FOR DELETE
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role');