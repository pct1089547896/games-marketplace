import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { ContentRating, UserProfile } from '../types';
import StarRating from '../components/StarRating';
import { 
  Check, 
  X, 
  Eye, 
  User, 
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';

interface ReviewWithProfile extends ContentRating {
  user_profile?: UserProfile;
  content_title?: string;
  content_type: 'game' | 'program';
}

const AdminReviewManagement: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<ReviewWithProfile | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('content_ratings')
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('is_approved', filter === 'approved');
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Fetch content titles for each review
      const reviewsWithTitles = await Promise.all(
        (data || []).map(async (review) => {
          try {
            const tableName = review.content_type === 'game' ? 'games' : 'programs';
            const { data: contentData } = await supabase
              .from(tableName)
              .select('title')
              .eq('id', review.content_id)
              .single();

            return {
              ...review,
              content_title: contentData?.title || 'Unknown Content'
            };
          } catch {
            return {
              ...review,
              content_title: 'Unknown Content'
            };
          }
        })
      );

      setReviews(reviewsWithTitles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('content_ratings')
        .update({ is_approved: approved })
        .eq('id', reviewId);

      if (error) throw error;

      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, is_approved: approved }
          : review
      ));

      // Close modal if open
      if (showModal) {
        setShowModal(false);
        setSelectedReview(null);
      }

      // If we're filtering and the item no longer matches, remove it
      if (filter !== 'all') {
        setReviews(reviews.filter(review => review.id !== reviewId));
      }

    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Check className="w-3 h-3 mr-1" />
          {t('admin.approved')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Eye className="w-3 h-3 mr-1" />
          {t('admin.pending')}
        </span>
      );
    }
  };

  const ReviewModal = () => {
    if (!selectedReview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.reviewDetails')}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Content Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('admin.contentInformation')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('common.title')}:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedReview.content_title}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('common.type')}:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {selectedReview.content_type === 'game' ? t('common.game') : t('common.program')}
                  </span>
                </div>
              </div>
            </div>

            {/* Reviewer Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {t('admin.reviewerInformation')}
              </h4>
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {selectedReview.user_profile?.display_name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedReview.user_profile?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {t('admin.reviewContent')}
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('common.rating')}:</span>
                  <StarRating rating={selectedReview.rating} showCount={false} size={16} />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {selectedReview.rating}/5
                  </span>
                </div>

                {selectedReview.review_text && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-2">
                      {t('admin.reviewText')}:
                    </span>
                    <div className="bg-white dark:bg-gray-900 rounded border p-3">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {selectedReview.review_text}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.submittedOn')}:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(selectedReview.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.helpfulVotes')}:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {selectedReview.helpfulness_count}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600 dark:text-gray-400">{t('admin.status')}:</span>
                  <span className="ml-2">{getStatusBadge(selectedReview.is_approved)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {t('common.cancel')}
              </button>
              {!selectedReview.is_approved && (
                <button
                  onClick={() => handleReviewAction(selectedReview.id, true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('admin.approve')}</span>
                </button>
              )}
              <button
                onClick={() => handleReviewAction(selectedReview.id, false)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>{t('admin.reject')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.reviewManagement')}
        </h2>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'pending', 'approved'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t(`admin.${filterType}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.noReviews')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.noReviewsDescription')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <StarRating rating={review.rating} showCount={false} size={16} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {review.content_title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({review.content_type})
                      </span>
                      {getStatusBadge(review.is_approved)}
                    </div>
                    
                    {review.review_text && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                        {review.review_text}
                      </p>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 space-x-4">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{review.user_profile?.display_name || 'Unknown'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{review.helpfulness_count}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowModal(true);
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      title={t('admin.viewDetails')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {!review.is_approved && (
                      <button
                        onClick={() => handleReviewAction(review.id, true)}
                        className="p-2 text-green-600 hover:text-green-700"
                        title={t('admin.approve')}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleReviewAction(review.id, false)}
                      className="p-2 text-red-600 hover:text-red-700"
                      title={t('admin.reject')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <ReviewModal />}
    </div>
  );
};

export default AdminReviewManagement;