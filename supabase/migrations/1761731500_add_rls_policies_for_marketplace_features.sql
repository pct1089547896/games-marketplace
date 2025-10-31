-- Migration: add_rls_policies_for_marketplace_features
-- Created at: 1761731500

-- Enable RLS on new tables
ALTER TABLE content_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;

-- Content Ratings Policies
CREATE POLICY "Public can view approved ratings" ON content_ratings
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create their own ratings" ON content_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON content_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON content_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Download Tracking Policies (public read for stats)
CREATE POLICY "Public can view download stats" ON download_tracking
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can track downloads" ON download_tracking
  FOR INSERT WITH CHECK (true);

-- User Favorites Policies
CREATE POLICY "Users can view their own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Featured Collections Policies (public read, admin write)
CREATE POLICY "Public can view active collections" ON featured_collections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage collections" ON featured_collections
  FOR ALL USING (true);

-- Version History Policies (public read)
CREATE POLICY "Public can view version history" ON content_version_history
  FOR SELECT USING (true);

-- User Achievements Policies
CREATE POLICY "Public can view achievements" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Service role can award achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

-- Content Reports Policies
CREATE POLICY "Users can view their own reports" ON content_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Review Helpfulness Policies
CREATE POLICY "Public can view helpfulness" ON review_helpfulness
  FOR SELECT USING (true);

CREATE POLICY "Users can vote helpfulness" ON review_helpfulness
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes" ON review_helpfulness
  FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_content_ratings_content ON content_ratings(content_id, content_type);
CREATE INDEX idx_content_ratings_user ON content_ratings(user_id);
CREATE INDEX idx_content_ratings_approved ON content_ratings(is_approved);
CREATE INDEX idx_download_tracking_content ON download_tracking(content_id, content_type);
CREATE INDEX idx_download_tracking_date ON download_tracking(downloaded_at DESC);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_content ON user_favorites(content_id, content_type);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_review_helpfulness_review ON review_helpfulness(review_id);;