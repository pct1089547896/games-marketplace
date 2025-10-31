-- Migration: marketplace_enhancements_all_phases
-- Created at: 1761857220

-- ========================================
-- MARKETPLACE ENHANCEMENTS - ALL 6 PHASES
-- ========================================

-- PHASE 1: VERSION MANAGEMENT SYSTEM
-- ========================================
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('game', 'program')),
    version_number TEXT NOT NULL,
    changelog TEXT NOT NULL,
    download_url TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_latest BOOLEAN DEFAULT false,
    CONSTRAINT unique_content_version UNIQUE (content_id, content_type, version_number)
);

CREATE INDEX idx_content_versions_content ON public.content_versions(content_id, content_type);
CREATE INDEX idx_content_versions_latest ON public.content_versions(content_id, content_type, is_latest) WHERE is_latest = true;

-- RLS for content_versions
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view versions" ON public.content_versions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert versions" ON public.content_versions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update versions" ON public.content_versions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- PHASE 2: NOTIFICATIONS SYSTEM
-- ========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_content', 'content_update', 'new_version', 'reply', 'mention', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    in_app_notifications BOOLEAN DEFAULT true,
    notify_new_content BOOLEAN DEFAULT true,
    notify_content_updates BOOLEAN DEFAULT true,
    notify_new_versions BOOLEAN DEFAULT true,
    notify_replies BOOLEAN DEFAULT true,
    notify_mentions BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- PHASE 3: ENHANCED ADMIN ANALYTICS
-- ========================================
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_id UUID,
    content_type TEXT CHECK (content_type IN ('game', 'program', 'blog')),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_id TEXT,
    ip_address TEXT
);

CREATE INDEX idx_page_views_content ON public.page_views(content_id, content_type);
CREATE INDEX idx_page_views_date ON public.page_views(viewed_at DESC);
CREATE INDEX idx_page_views_user ON public.page_views(user_id);

CREATE TABLE IF NOT EXISTS public.downloads_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('game', 'program')),
    version_id UUID REFERENCES public.content_versions(id) ON DELETE SET NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address TEXT
);

CREATE INDEX idx_downloads_log_content ON public.downloads_log(content_id, content_type);
CREATE INDEX idx_downloads_log_date ON public.downloads_log(downloaded_at DESC);
CREATE INDEX idx_downloads_log_user ON public.downloads_log(user_id);

-- RLS for analytics tables (admin only)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views" ON public.page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert downloads" ON public.downloads_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" ON public.page_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can view all downloads" ON public.downloads_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- PHASE 5: SOCIAL FEATURES
-- ========================================
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL,
    followed_type TEXT NOT NULL CHECK (followed_type IN ('user', 'developer', 'publisher')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_follow UNIQUE (follower_id, followed_id, followed_type)
);

CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_followed ON public.follows(followed_id, followed_type);

-- RLS for follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON public.follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON public.follows
    FOR ALL USING (auth.uid() = follower_id);

-- PHASE 6: ADVANCED FEATURES
-- ========================================

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT
);

CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers(is_active);

-- Content Reports
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('game', 'program', 'blog', 'forum_thread', 'forum_reply')),
    reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'broken_link', 'malware', 'copyright', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes TEXT
);

CREATE INDEX idx_reports_status ON public.content_reports(status);
CREATE INDEX idx_reports_content ON public.content_reports(content_id, content_type);
CREATE INDEX idx_reports_reporter ON public.content_reports(reported_by);

-- User Reputation
CREATE TABLE IF NOT EXISTS public.user_reputation (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_reputation_points ON public.user_reputation(points DESC);
CREATE INDEX idx_reputation_level ON public.user_reputation(level DESC);

-- RLS for newsletter (public can subscribe)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Subscribers can view own subscription" ON public.newsletter_subscribers
    FOR SELECT USING (true);

-- RLS for content_reports
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can report content" ON public.content_reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own reports" ON public.content_reports
    FOR SELECT USING (auth.uid() = reported_by OR EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Admins can update reports" ON public.content_reports
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND is_admin = true
    ));

-- RLS for user_reputation
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reputation" ON public.user_reputation
    FOR SELECT USING (true);

CREATE POLICY "System can manage reputation" ON public.user_reputation
    FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to auto-create notification preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_prefs()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_reputation (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user notification preferences
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_prefs
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notification_prefs();

-- Function to mark old versions as not latest when new version is marked latest
CREATE OR REPLACE FUNCTION public.handle_latest_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_latest = true THEN
        UPDATE public.content_versions
        SET is_latest = false
        WHERE content_id = NEW.content_id
            AND content_type = NEW.content_type
            AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_latest_version ON public.content_versions;
CREATE TRIGGER ensure_single_latest_version
    BEFORE INSERT OR UPDATE ON public.content_versions
    FOR EACH ROW
    WHEN (NEW.is_latest = true)
    EXECUTE FUNCTION public.handle_latest_version();

-- Function to track page views (call from frontend)
CREATE OR REPLACE FUNCTION public.track_page_view(
    p_content_id UUID,
    p_content_type TEXT,
    p_session_id TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.page_views (user_id, content_id, content_type, session_id)
    VALUES (auth.uid(), p_content_id, p_content_type, p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track downloads
CREATE OR REPLACE FUNCTION public.track_download(
    p_content_id UUID,
    p_content_type TEXT,
    p_version_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.downloads_log (user_id, content_id, content_type, version_id)
    VALUES (auth.uid(), p_content_id, p_content_type, p_version_id);
    
    -- Update download count
    IF p_content_type = 'game' THEN
        UPDATE public.games SET download_count = download_count + 1 WHERE id = p_content_id;
    ELSIF p_content_type = 'program' THEN
        UPDATE public.programs SET download_count = download_count + 1 WHERE id = p_content_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;