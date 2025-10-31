import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface FollowButtonProps {
  followedId: string;
  followedType: 'user' | 'developer' | 'publisher';
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ 
  followedId, 
  followedType,
  onFollowChange 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFollowStatus();
    }
  }, [user, followedId, followedType]);

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_id', followedId)
        .eq('followed_type', followedType)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      alert('Please log in to follow');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', followedId)
          .eq('followed_type', followedType);

        if (error) throw error;
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            followed_id: followedId,
            followed_type: followedType
          });

        if (error) throw error;
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition ${
        isFollowing
          ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};
