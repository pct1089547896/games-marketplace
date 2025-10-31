import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  UserProfile, 
  UserAchievement, 
  UserFavorite, 
  Game, 
  Program, 
  DownloadTracking,
  ContentRating 
} from '../types';
import ContentCard from '../components/ContentCard';
import StarRating from '../components/StarRating';
import { 
  User, 
  Calendar,
  FileText,
  Heart,
  Download,
  Trophy,
  Eye,
  MessageCircle
} from 'lucide-react';

interface UserStats {
  totalUploads: number;
  totalDownloads: number;
  totalFavorites: number;
  totalRatings: number;
  averageRating: number;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [uploads, setUploads] = useState<(Game | Program)[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadTracking[]>([]);
  const [userRatings, setUserRatings] = useState<ContentRating[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUploads: 0,
    totalDownloads: 0,
    totalFavorites: 0,
    totalRatings: 0,
    averageRating: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'uploads' | 'favorites' | 'reviews' | 'downloads'>('overview');
  const [loading, setLoading] = useState(true);
  const [favoriteContent, setFavoriteContent] = useState<(Game | Program)[]>([]);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (achievementsData) setAchievements(achievementsData);

      // Fetch user favorites
      const { data: favoritesData } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId);

      if (favoritesData) {
        setFavorites(favoritesData);
        await fetchFavoriteContent(favoritesData);
      }

      // Fetch user uploads
      await fetchUserUploads();

      // Fetch user ratings
      const { data: ratingsData } = await supabase
        .from('content_ratings')
        .select('*')
        .eq('user_id', userId);

      if (ratingsData) setUserRatings(ratingsData);

      // Fetch download history (only for own profile)
      if (isOwnProfile) {
        const { data: downloadsData } = await supabase
          .from('download_tracking')
          .select('*')
          .eq('user_id', userId)
          .order('downloaded_at', { ascending: false })
          .limit(50);

        if (downloadsData) setDownloadHistory(downloadsData);
      }

      // Calculate stats
      calculateStats();

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteContent = async (favoritesList: UserFavorite[]) => {
    const gameIds = favoritesList.filter(f => f.content_type === 'game').map(f => f.content_id);
    const programIds = favoritesList.filter(f => f.content_type === 'program').map(f => f.content_id);

    const content: (Game | Program)[] = [];

    if (gameIds.length > 0) {
      const { data: gamesData } = await supabase
        .from('games')
        .select('*')
        .in('id', gameIds);
      
      if (gamesData) content.push(...gamesData);
    }

    if (programIds.length > 0) {
      const { data: programsData } = await supabase
        .from('programs')
        .select('*')
        .in('id', programIds);
      
      if (programsData) content.push(...programsData);
    }

    setFavoriteContent(content);
  };

  const fetchUserUploads = async () => {
    const content: (Game | Program)[] = [];

    // Fetch user's games
    const { data: gamesData } = await supabase
      .from('games')
      .select('*')
      .eq('uploader_id', userId);

    if (gamesData) content.push(...gamesData);

    // Fetch user's programs
    const { data: programsData } = await supabase
      .from('programs')
      .select('*')
      .eq('uploader_id', userId);

    if (programsData) content.push(...programsData);

    setUploads(content);
  };

  const calculateStats = () => {
    // This would be calculated based on the fetched data
    setStats({
      totalUploads: uploads.length,
      totalDownloads: uploads.reduce((sum, item) => sum + item.download_count, 0),
      totalFavorites: favorites.length,
      totalRatings: userRatings.length,
      averageRating: userRatings.length > 0 ? 
        userRatings.reduce((sum, rating) => sum + rating.rating, 0) / userRatings.length : 0
    });
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'top_contributor':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'early_adopter':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'game_reviewer':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'downloader':
        return <Download className="w-5 h-5 text-purple-500" />;
      case 'community_helper':
        return <Heart className="w-5 h-5 text-red-500" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBadgeName = (badgeType: string) => {
    return t(`badges.${badgeType}`);
  };

  const getContentType = (item: Game | Program): 'game' | 'program' => {
    // We can determine type by checking which array the item came from
    // or by checking if the item exists in uploads array and what table it came from
    return 'game'; // For now, default to game - we'll improve this later
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('profile.userNotFound')}
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profile.display_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('profile.memberSince')} {new Date(profile.created_at).toLocaleDateString()}
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUploads}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('profile.uploads')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalFavorites}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('profile.favorites')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRatings}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('profile.reviews')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('profile.avgRating')}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {achievements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('profile.achievements')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className="flex items-center space-x-2 bg-white dark:bg-black px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700"
                      >
                        {getBadgeIcon(achievement.badge_type)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getBadgeName(achievement.badge_type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'uploads', 'favorites', 'reviews', ...(isOwnProfile ? ['downloads'] : [])].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-black dark:border-white text-black dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t(`profile.tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Uploads */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('profile.recentUploads')}
                </h3>
                <div className="space-y-4">
                  {uploads.slice(0, 3).map((item) => (
                    <ContentCard key={item.id} item={item} type='game' />
                  ))}
                  {uploads.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('profile.noUploads')}
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Favorites */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('profile.recentFavorites')}
                </h3>
                <div className="space-y-4">
                  {favoriteContent.slice(0, 3).map((item) => (
                    <ContentCard key={item.id} item={item} type='game' />
                  ))}
                  {favoriteContent.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('profile.noFavorites')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('profile.allUploads')} ({uploads.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploads.map((item) => (
                  <ContentCard key={item.id} item={item} type='game' />
                ))}
                {uploads.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('profile.noUploads')}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('profile.allFavorites')} ({favoriteContent.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteContent.map((item) => (
                  <ContentCard key={item.id} item={item} type='game' />
                ))}
                {favoriteContent.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('profile.noFavorites')}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('profile.allReviews')} ({userRatings.length})
              </h3>
              <div className="space-y-4">
                {userRatings.map((rating) => (
                  <div key={rating.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <StarRating rating={rating.rating} size={16} interactive={false} showCount={false} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review_text && (
                      <p className="text-gray-700 dark:text-gray-300">{rating.review_text}</p>
                    )}
                  </div>
                ))}
                {userRatings.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('profile.noReviews')}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'downloads' && isOwnProfile && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('profile.downloadHistory')} ({downloadHistory.length})
              </h3>
              <div className="space-y-2">
                {downloadHistory.map((download) => (
                  <div key={download.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {download.content_type === 'game' ? t('common.game') : t('common.program')}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        ID: {download.content_id}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(download.downloaded_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {downloadHistory.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('profile.noDownloads')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;