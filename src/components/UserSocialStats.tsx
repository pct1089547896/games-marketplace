import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserSocialStatsProps {
  userId: string;
  displayName?: string;
}

export const UserSocialStats: React.FC<UserSocialStatsProps> = ({ userId, displayName }) => {
  const { t } = useTranslation();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialStats();
  }, [userId]);

  const loadSocialStats = async () => {
    try {
      // Get followers count
      const { count: followers, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', userId)
        .eq('followed_type', 'user');

      if (followersError) throw followersError;

      // Get following count
      const { count: following, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) throw followingError;

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error loading social stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-6 animate-pulse">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Users size={20} className="text-gray-600" />
        <div>
          <div className="text-2xl font-bold">{followersCount}</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <UserPlus size={20} className="text-gray-600" />
        <div>
          <div className="text-2xl font-bold">{followingCount}</div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
      </div>
    </div>
  );
};
