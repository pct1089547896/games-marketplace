import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Heart, UserPlus, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'download' | 'favorite' | 'follow' | 'review';
  user_name: string;
  content_title?: string;
  content_type?: 'game' | 'program';
  content_id?: string;
  rating?: number;
  created_at: string;
}

export const CommunityActivityFeed: React.FC = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      // Get recent downloads
      const { data: downloads } = await supabase
        .from('downloads_log')
        .select(`
          id,
          content_id,
          content_type,
          downloaded_at,
          user:user_id (
            id,
            raw_user_meta_data
          )
        `)
        .order('downloaded_at', { ascending: false })
        .limit(10);

      // Get recent follows
      const { data: follows } = await supabase
        .from('follows')
        .select(`
          id,
          created_at,
          follower:follower_id (
            id,
            raw_user_meta_data
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent ratings
      const { data: ratings } = await supabase
        .from('content_ratings')
        .select(`
          id,
          rating,
          content_id,
          content_type,
          created_at,
          user_profile (
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Combine and format activities
      const allActivities: ActivityItem[] = [];

      downloads?.forEach((download: any) => {
        const userName = download.user?.raw_user_meta_data?.display_name;
        
        allActivities.push({
          id: download.id,
          type: 'download',
          user_name: userName || 'User',
          content_id: download.content_id,
          content_type: download.content_type,
          created_at: download.downloaded_at
        });
      });

      follows?.forEach((follow: any) => {
        const userName = follow.follower?.raw_user_meta_data?.display_name;
        
        allActivities.push({
          id: follow.id,
          type: 'follow',
          user_name: userName || 'User',
          created_at: follow.created_at
        });
      });

      ratings?.forEach((rating: any) => {
        const userName = rating.user_profile?.display_name;
        
        allActivities.push({
          id: rating.id,
          type: 'review',
          user_name: userName || 'User',
          content_id: rating.content_id,
          content_type: rating.content_type,
          rating: rating.rating,
          created_at: rating.created_at
        });
      });

      // Sort by date and take top 20
      allActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(allActivities.slice(0, 20));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'download': return <Download size={18} className="text-blue-600" />;
      case 'favorite': return <Heart size={18} className="text-red-600" />;
      case 'follow': return <UserPlus size={18} className="text-green-600" />;
      case 'review': return <Star size={18} className="text-yellow-600" />;
      default: return null;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'download':
        return (
          <>
            <span className="font-semibold">{activity.user_name}</span>
            {' downloaded a '}
            {activity.content_type && activity.content_id ? (
              <Link 
                to={`/${activity.content_type}s/${activity.content_id}`}
                className="text-blue-600 hover:underline"
              >
                {activity.content_type}
              </Link>
            ) : (
              <span>{activity.content_type}</span>
            )}
          </>
        );
      case 'follow':
        return (
          <>
            <span className="font-semibold">{activity.user_name}</span>
            {' started following a developer'}
          </>
        );
      case 'review':
        return (
          <>
            <span className="font-semibold">{activity.user_name}</span>
            {' rated a '}
            {activity.content_type && activity.content_id ? (
              <Link 
                to={`/${activity.content_type}s/${activity.content_id}`}
                className="text-blue-600 hover:underline"
              >
                {activity.content_type}
              </Link>
            ) : (
              <span>{activity.content_type}</span>
            )}
            {activity.rating && (
              <span className="ml-1">
                ({activity.rating} ⭐)
              </span>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Community Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Community Activity</h3>
      
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
              <div className="mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-700">
                  {getActivityText(activity)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getTimeAgo(activity.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
