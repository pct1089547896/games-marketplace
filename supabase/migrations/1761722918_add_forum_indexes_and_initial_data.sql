-- Migration: add_forum_indexes_and_initial_data
-- Created at: 1761722918

-- Create indexes for better query performance
CREATE INDEX idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX idx_forum_threads_pinned ON forum_threads(pinned) WHERE pinned = true;

CREATE INDEX idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX idx_forum_replies_parent_reply_id ON forum_replies(parent_reply_id) WHERE parent_reply_id IS NOT NULL;
CREATE INDEX idx_forum_replies_created_at ON forum_replies(created_at DESC);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Insert initial forum categories
INSERT INTO forum_categories (name, description, slug, order_index) VALUES
  ('General Discussion', 'General topics and community discussions', 'general-discussion', 1),
  ('Game Reviews', 'Share your thoughts and reviews on games from our marketplace', 'game-reviews', 2),
  ('Programming Help', 'Get help with programming, development, and technical questions', 'programming-help', 3),
  ('News & Updates', 'Latest news, announcements, and platform updates', 'news-updates', 4),
  ('Off-Topic', 'Everything else that doesn''t fit in other categories', 'off-topic', 5);

-- Create function to automatically update thread_count in categories
CREATE OR REPLACE FUNCTION update_category_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_categories 
    SET thread_count = thread_count + 1 
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_categories 
    SET thread_count = GREATEST(0, thread_count - 1)
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_thread_count
AFTER INSERT OR DELETE ON forum_threads
FOR EACH ROW EXECUTE FUNCTION update_category_thread_count();

-- Create function to automatically update reply_count in threads
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads 
    SET reply_count = reply_count + 1,
        updated_at = NOW()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads 
    SET reply_count = GREATEST(0, reply_count - 1),
        updated_at = NOW()
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_reply_count
AFTER INSERT OR DELETE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Create function to update user post count
CREATE OR REPLACE FUNCTION update_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles 
    SET post_count = post_count + 1,
        last_active = NOW()
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles 
    SET post_count = GREATEST(0, post_count - 1)
    WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_post_count_threads
AFTER INSERT OR DELETE ON forum_threads
FOR EACH ROW EXECUTE FUNCTION update_user_post_count();

CREATE TRIGGER trigger_update_user_post_count_replies
AFTER INSERT OR DELETE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_user_post_count();;