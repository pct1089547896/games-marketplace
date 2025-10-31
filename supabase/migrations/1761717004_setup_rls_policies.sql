-- Migration: setup_rls_policies
-- Created at: 1761717004

-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for games
CREATE POLICY "Allow public read access for games" ON games
  FOR SELECT USING (true);

-- Allow insert/update/delete via service role (admin panel)
CREATE POLICY "Allow admin insert games" ON games
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin update games" ON games
  FOR UPDATE
  USING (auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin delete games" ON games
  FOR DELETE
  USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Public read access for programs
CREATE POLICY "Allow public read access for programs" ON programs
  FOR SELECT USING (true);

-- Allow insert/update/delete via service role (admin panel)
CREATE POLICY "Allow admin insert programs" ON programs
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin update programs" ON programs
  FOR UPDATE
  USING (auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin delete programs" ON programs
  FOR DELETE
  USING (auth.role() = 'anon' OR auth.role() = 'service_role');

-- Public read access for blog posts (only published)
CREATE POLICY "Allow public read published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Allow insert/update/delete via service role (admin panel)
CREATE POLICY "Allow admin insert blog posts" ON blog_posts
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin update blog posts" ON blog_posts
  FOR UPDATE
  USING (auth.role() = 'anon' OR auth.role() = 'service_role');

CREATE POLICY "Allow admin delete blog posts" ON blog_posts
  FOR DELETE
  USING (auth.role() = 'anon' OR auth.role() = 'service_role');;