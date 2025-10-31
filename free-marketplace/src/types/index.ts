export interface Game {
  id: string;
  title: string;
  description: string;
  download_link: string;
  category: string;
  screenshots: string[];
  featured: boolean;
  view_count: number;
  download_count: number;
  platform: string[];
  tags: string[];
  current_version: string;
  system_requirements: Record<string, any>;
  os_requirements?: string;
  ram_requirements?: string;
  storage_requirements?: string;
  processor_requirements?: string;
  graphics_requirements?: string;
  average_rating: number;
  total_ratings: number;
  content_status: 'stable' | 'beta' | 'development';
  is_verified: boolean;
  uploader_id: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
  gallery_layout?: string;
  gallery_theme?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  download_link: string;
  category: string;
  screenshots: string[];
  featured: boolean;
  view_count: number;
  download_count: number;
  platform: string[];
  tags: string[];
  current_version: string;
  system_requirements: Record<string, any>;
  os_requirements?: string;
  ram_requirements?: string;
  storage_requirements?: string;
  processor_requirements?: string;
  average_rating: number;
  total_ratings: number;
  content_status: 'stable' | 'beta' | 'development';
  is_verified: boolean;
  uploader_id: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
  gallery_layout?: string;
  gallery_theme?: string;
}

export interface ContentRating {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'game' | 'program';
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  helpfulness_count: number;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'game' | 'program';
  added_at: string;
}

export interface FeaturedCollection {
  id: string;
  name: string;
  description: string;
  content_items: any[];
  collection_type: 'game' | 'program' | 'mixed';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  publish_date: string;
  featured_image: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  gallery_layout?: string;
  gallery_theme?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  post_count: number;
  created_at: string;
  last_active: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  badge_type: 'top_contributor' | 'early_adopter' | 'game_reviewer' | 'downloader' | 'community_helper';
  earned_at: string;
}

export interface DownloadTracking {
  id: string;
  user_id: string | null;
  content_id: string;
  content_type: 'game' | 'program';
  ip_address: string;
  downloaded_at: string;
}

export interface VersionHistory {
  id: string;
  content_id: string;
  content_type: 'game' | 'program';
  version: string;
  changelog: string;
  released_at: string;
}

export interface ContentReport {
  id: string;
  content_id: string;
  content_type: 'game' | 'program' | 'blog' | 'forum_thread' | 'forum_reply';
  reporter_id: string;
  reason: 'spam' | 'inappropriate' | 'broken_link' | 'malware' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  admin_notes?: string;
}

export interface ReviewHelpfulness {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  order_index: number;
  thread_count: number;
  created_at: string;
}

export interface ForumThread {
  id: string;
  category_id: string;
  title: string;
  content: string;
  author_id: string;
  view_count: number;
  reply_count: number;
  pinned: boolean;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  parent_reply_id: string | null;
  content: string;
  author_id: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

// PHASE 1: Version Management
export interface ContentVersion {
  id: string;
  content_id: string;
  content_type: 'game' | 'program';
  version_number: string;
  changelog: string;
  download_url: string;
  file_size: number | null;
  created_at: string;
  is_latest: boolean;
}

// PHASE 2: Notifications
export interface Notification {
  id: string;
  user_id: string;
  type: 'new_content' | 'content_update' | 'new_version' | 'reply' | 'mention' | 'system';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  notify_new_content: boolean;
  notify_content_updates: boolean;
  notify_new_versions: boolean;
  notify_replies: boolean;
  notify_mentions: boolean;
  created_at: string;
  updated_at: string;
}

// PHASE 3: Analytics
export interface PageView {
  id: string;
  user_id: string | null;
  content_id: string | null;
  content_type: 'game' | 'program' | 'blog' | null;
  viewed_at: string;
  session_id: string | null;
  ip_address: string | null;
}

export interface DownloadsLog {
  id: string;
  user_id: string | null;
  content_id: string;
  content_type: 'game' | 'program';
  version_id: string | null;
  downloaded_at: string;
  ip_address: string | null;
}

// PHASE 5: Social Features
export interface Follow {
  id: string;
  follower_id: string;
  followed_id: string;
  followed_type: 'user' | 'developer' | 'publisher';
  created_at: string;
}

// PHASE 6: Advanced Features
export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  unsubscribe_token: string;
}

export interface ContentReport {
  id: string;
  content_id: string;
  content_type: 'game' | 'program' | 'blog' | 'forum_thread' | 'forum_reply';
  reporter_id: string;
  reason: 'spam' | 'inappropriate' | 'broken_link' | 'malware' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  admin_notes?: string;
}

export interface UserReputation {
  user_id: string;
  points: number;
  level: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}
