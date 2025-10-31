import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Game, Program, ContentRating } from '../types';
import StarRating from '../components/StarRating';
import FavoriteButton from '../components/FavoriteButton';
import ReviewHelpfulness from '../components/ReviewHelpfulness';
import RichContentRenderer from '../components/RichContentRenderer';
import GalleryDisplay from '../components/GalleryDisplay';
import { VersionSelector } from '../components/VersionSelector';
import { SocialShare } from '../components/SocialShare';
import { RelatedContent } from '../components/RelatedContent';
import { ReportButton } from '../components/ReportButton';
import { SystemRequirements } from '../components/SystemRequirements';
import { Download, Eye, Calendar, Package, Shield, Star, ThumbsUp } from 'lucide-react';

export default function GameDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [ratings, setRatings] = useState<ContentRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGameDetails();
      fetchRatings();
    }
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!showLightbox || !game?.screenshots) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLightbox(false);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : game.screenshots!.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev < game.screenshots!.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, game]);

  async function fetchGameDetails() {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRatings() {
    try {
      const { data, error } = await supabase
        .from('content_ratings')
        .select(`
          *,
          user_profile:user_profiles(display_name, avatar_url)
        `)
        .eq('content_id', id)
        .eq('content_type', 'game')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  }

  async function handleDownload() {
    if (!game) return;

    try {
      await supabase.functions.invoke('track-download', {
        body: {
          contentId: game.id,
          contentType: 'game'
        }
      });

      // Update local download count
      setGame({ ...game, download_count: (game.download_count || 0) + 1 });

      // Open download link
      window.open(game.download_link, '_blank');
    } catch (error) {
      console.error('Download tracking error:', error);
      window.open(game.download_link, '_blank');
    }
  }

  async function handleSubmitReview() {
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-rating', {
        body: {
          contentId: game?.id,
          contentType: 'game',
          rating: userRating,
          reviewText: reviewText || null
        }
      });

      if (error) throw error;

      alert('Review submitted successfully! Pending admin approval.');
      setShowReviewForm(false);
      setUserRating(0);
      setReviewText('');
      fetchGameDetails();
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game not found</h2>
          <Link to="/games" className="text-blue-600 hover:underline">
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/games" className="inline-flex items-center text-gray-600 hover:text-black mb-6">
          <span className="mr-2">←</span> Back to Games
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Main Image */}
              <div className="md:w-1/2">
                {/* Main Display Image */}
                <div className="relative group">
                  <img
                    src={game.screenshots?.[selectedImageIndex] || 'https://via.placeholder.com/600x400?text=No+Image'}
                    alt={game.title}
                    className="w-full h-[500px] object-cover rounded-lg cursor-zoom-in"
                    onClick={() => setShowLightbox(true)}
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition rounded-lg pointer-events-none"></div>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {game.screenshots?.length || 1}
                  </div>
                </div>
                
                {/* Screenshot Gallery Thumbnails */}
                {game.screenshots && game.screenshots.length > 1 && (
                  <div className="mt-4 grid grid-cols-5 gap-3">
                    {game.screenshots.map((screenshot, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                          selectedImageIndex === index
                            ? 'ring-4 ring-black shadow-lg scale-105'
                            : 'hover:opacity-80 hover:scale-105'
                        }`}
                      >
                        <img
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 border-2 border-black bg-black bg-opacity-10"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="md:w-1/2">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{game.title}</h1>
                  <FavoriteButton contentId={game.id} contentType="game" size={24} />
                </div>

                {/* Rating */}
                {game.average_rating > 0 && (
                  <div className="mb-4">
                    <StarRating 
                      rating={game.average_rating} 
                      totalRatings={game.total_ratings}
                      size={20}
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye size={20} />
                    <span>{game.view_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download size={20} />
                    <span>{game.download_count || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>{new Date(game.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {game.category && (
                    <span className="px-3 py-1 bg-black text-white rounded-full text-sm">
                      {game.category}
                    </span>
                  )}
                  {game.platform?.map((platform, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                      {platform}
                    </span>
                  ))}
                  {game.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 mb-6">
                  {game.is_verified && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                      <Shield size={16} />
                      <span>Verified</span>
                    </div>
                  )}
                  {game.content_status && (
                    <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm capitalize">
                      {game.content_status}
                    </div>
                  )}
                  {game.current_version && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      <Package size={16} />
                      <span>v{game.current_version}</span>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full bg-black text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3"
                >
                  <Download size={24} />
                  Download Now
                </button>

                {/* Version Selector */}
                <div className="mt-6">
                  <VersionSelector 
                    contentId={game.id}
                    contentType="game"
                  />
                </div>

                {/* Social Share & Report */}
                <div className="mt-6 flex items-center justify-between">
                  <SocialShare title={game.title} />
                  <ReportButton contentId={game.id} contentType="game" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <RichContentRenderer 
                content={game.description} 
                className="text-gray-700"
              />
            </div>

            {/* System Requirements */}
            <div className="mt-8">
              <SystemRequirements
                osRequirements={game.os_requirements}
                ramRequirements={game.ram_requirements}
                storageRequirements={game.storage_requirements}
                processorRequirements={game.processor_requirements}
                graphicsRequirements={game.graphics_requirements}
              />
            </div>

            {/* Image Gallery */}
            {game.id && (
              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                <GalleryDisplay
                  postId={game.id}
                  postType="game"
                  layout={(game.gallery_layout as 'grid' | 'carousel' | 'masonry' | 'slideshow') || 'grid'}
                  theme={(game.gallery_theme as 'default' | 'dark' | 'minimal') || 'default'}
                />
              </div>
            )}

            {/* System Requirements */}
            {game.system_requirements && Object.keys(game.system_requirements).length > 0 && (
              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-bold mb-4">System Requirements</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(game.system_requirements, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="border-t bg-gray-50 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Reviews ({ratings.length})</h2>
              {user && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <Star size={18} />
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-bold mb-4">Your Review</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <StarRating
                    rating={userRating}
                    size={24}
                    interactive={true}
                    showCount={false}
                    onRate={setUserRating}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Review (optional)</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    rows={4}
                    placeholder="Share your thoughts about this game..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setUserRating(0);
                      setReviewText('');
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {ratings.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {rating.user_profile?.display_name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{rating.user_profile?.display_name || 'Anonymous'}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <StarRating rating={rating.rating} size={16} showCount={false} />
                      </div>
                    </div>
                    {rating.review_text && (
                      <p className="text-gray-700 mt-3">{rating.review_text}</p>
                    )}
                    <div className="mt-3">
                      <ReviewHelpfulness 
                        reviewId={rating.id}
                        initialHelpfulCount={rating.helpfulness_count || 0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Content */}
        <div className="mt-12 px-4 pb-12">
          <RelatedContent 
            contentId={game.id}
            contentType="game"
            category={game.category}
            tags={game.tags || []}
            maxItems={6}
          />
        </div>

        {/* Lightbox Modal */}
        {showLightbox && game.screenshots && (
          <div
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition"
              onClick={() => setShowLightbox(false)}
            >
              ×
            </button>
            
            <button
              className="absolute left-4 text-white text-4xl hover:text-gray-300 transition disabled:opacity-30"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : game.screenshots!.length - 1));
              }}
              disabled={game.screenshots.length <= 1}
            >
              ←
            </button>
            
            <button
              className="absolute right-4 text-white text-4xl hover:text-gray-300 transition disabled:opacity-30"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev < game.screenshots!.length - 1 ? prev + 1 : 0));
              }}
              disabled={game.screenshots.length <= 1}
            >
              →
            </button>
            
            <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={game.screenshots[selectedImageIndex]}
                alt={`${game.title} - Screenshot ${selectedImageIndex + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              <div className="text-center mt-4 text-white text-lg">
                {selectedImageIndex + 1} / {game.screenshots.length}
              </div>
              
              {/* Thumbnail navigation in lightbox */}
              {game.screenshots.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                  {game.screenshots.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`Thumbnail ${index + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`w-20 h-20 object-cover rounded cursor-pointer transition ${
                        selectedImageIndex === index
                          ? 'ring-4 ring-white'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
