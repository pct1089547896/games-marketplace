import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReviewHelpfulnessProps {
  reviewId: string;
  initialHelpfulCount: number;
  className?: string;
}

interface HelpfulnessVote {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

const ReviewHelpfulness: React.FC<ReviewHelpfulnessProps> = ({
  reviewId,
  initialHelpfulCount,
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserVote();
    }
  }, [user, reviewId]);

  const fetchUserVote = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('review_helpfulness')
        .select('is_helpful')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserVote(data.is_helpful);
        setHasVoted(true);
      }
    } catch (error) {
      // User hasn't voted yet, which is fine
      setUserVote(null);
      setHasVoted(false);
    }
  };

  const handleVote = async (isHelpful: boolean) => {
    if (!user || loading) return;

    try {
      setLoading(true);

      if (hasVoted) {
        // Update existing vote
        const { error } = await supabase
          .from('review_helpfulness')
          .update({ is_helpful: isHelpful })
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update count based on vote change
        if (userVote !== isHelpful) {
          if (isHelpful && !userVote) {
            // Changed from not helpful to helpful
            setHelpfulCount(prev => prev + 1);
          } else if (!isHelpful && userVote) {
            // Changed from helpful to not helpful
            setHelpfulCount(prev => prev - 1);
          }
        }
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('review_helpfulness')
          .insert([{
            review_id: reviewId,
            user_id: user.id,
            is_helpful: isHelpful
          }]);

        if (error) throw error;

        // Increment count if helpful vote
        if (isHelpful) {
          setHelpfulCount(prev => prev + 1);
        }

        setHasVoted(true);
      }

      setUserVote(isHelpful);

      // Update the helpfulness count in the content_ratings table
      await updateReviewHelpfulnessCount();

    } catch (error) {
      console.error('Error voting on review helpfulness:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewHelpfulnessCount = async () => {
    try {
      // Get the current count of helpful votes
      const { count } = await supabase
        .from('review_helpfulness')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId)
        .eq('is_helpful', true);

      // Update the content_ratings table
      await supabase
        .from('content_ratings')
        .update({ helpfulness_count: count || 0 })
        .eq('id', reviewId);

    } catch (error) {
      console.error('Error updating review helpfulness count:', error);
    }
  };

  const removeVote = async () => {
    if (!user || loading || !hasVoted) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('review_helpfulness')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update count if the removed vote was helpful
      if (userVote) {
        setHelpfulCount(prev => prev - 1);
      }

      setUserVote(null);
      setHasVoted(false);

      // Update the helpfulness count in the content_ratings table
      await updateReviewHelpfulnessCount();

    } catch (error) {
      console.error('Error removing vote:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 dark:text-gray-400 ${className}`}>
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm">{helpfulCount} {t('reviews.helpful')}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleVote(true)}
          disabled={loading}
          className={`p-1 rounded-full transition-colors ${
            userVote === true
              ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={t('reviews.markHelpful')}
        >
          <ThumbsUp className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleVote(false)}
          disabled={loading}
          className={`p-1 rounded-full transition-colors ${
            userVote === false
              ? 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={t('reviews.markNotHelpful')}
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {helpfulCount} {t('reviews.helpful')}
        </span>

        {hasVoted && (
          <button
            onClick={removeVote}
            disabled={loading}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            {t('reviews.removeVote')}
          </button>
        )}
      </div>

      {userVote !== null && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {userVote ? t('reviews.youMarkedHelpful') : t('reviews.youMarkedNotHelpful')}
        </span>
      )}
    </div>
  );
};

export default ReviewHelpfulness;