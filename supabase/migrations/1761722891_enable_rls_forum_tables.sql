-- Migration: enable_rls_forum_tables
-- Created at: 1761722891

-- Enable RLS on all forum tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "User profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Forum Categories Policies
CREATE POLICY "Categories are viewable by everyone"
  ON forum_categories FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can create categories"
  ON forum_categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can update categories"
  ON forum_categories FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only authenticated users can delete categories"
  ON forum_categories FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Forum Threads Policies
CREATE POLICY "Threads are viewable by everyone"
  ON forum_threads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Thread authors can update their threads"
  ON forum_threads FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Thread authors and authenticated users can delete threads"
  ON forum_threads FOR DELETE
  USING (auth.uid() = author_id OR auth.uid() IS NOT NULL);

-- Forum Replies Policies
CREATE POLICY "Replies are viewable by everyone"
  ON forum_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Reply authors can update their replies"
  ON forum_replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Reply authors can delete their replies"
  ON forum_replies FOR DELETE
  USING (auth.uid() = author_id);;