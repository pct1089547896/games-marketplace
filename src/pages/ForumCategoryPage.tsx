import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Pin, Lock, Plus, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ForumCategory, ForumThread, UserProfile } from '../types';

export default function ForumCategoryPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [authors, setAuthors] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCategory();
      fetchThreads();
    }
  }, [slug]);

  async function fetchCategory() {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category');
    }
  }

  async function fetchThreads() {
    try {
      // Workaround for missing foreign key constraint
      // First get the category to find its ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', slug)
        .single();

      if (categoryError) throw categoryError;

      // Then get threads for that category ID
      const { data: threadsData, error: threadsError } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (threadsError) {
        console.error('Supabase error:', threadsError);
        // If still failing due to missing schema, try without status filter
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('forum_threads')
          .select('*')
          .eq('category_id', categoryData.id)
          .order('pinned', { ascending: false })
          .order('updated_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        
        setThreads(fallbackData || []);
        console.log('Fetched threads (fallback):', fallbackData);
        
        if (fallbackData && fallbackData.length > 0) {
          const authorIds = [...new Set(fallbackData.map(thread => thread.author_id))];
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('*')
            .in('id', authorIds);

          if (profiles) {
            const authorsMap: Record<string, UserProfile> = {};
            profiles.forEach(profile => {
              authorsMap[profile.id] = profile;
            });
            setAuthors(authorsMap);
          }
        }
        return;
      }

      setThreads(threadsData || []);
      console.log('Fetched threads:', threadsData);
      
      if (threadsData && threadsData.length > 0) {
        const authorIds = [...new Set(threadsData.map(thread => thread.author_id))];
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', authorIds);

        if (profiles) {
          const authorsMap: Record<string, UserProfile> = {};
          profiles.forEach(profile => {
            authorsMap[profile.id] = profile;
          });
          setAuthors(authorsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError('Failed to load threads. Please check database configuration.');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('forums.justNow');
    if (diffMins < 60) return t('forums.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('forums.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('forums.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  }

  const getCategoryTranslation = (slug: string) => {
    const map: Record<string, string> = {
      'general-discussion': 'categories.generalDiscussion',
      'game-reviews': 'categories.gameReviews',
      'programming-help': 'categories.programmingHelp',
      'news-updates': 'categories.newsUpdates',
      'off-topic': 'categories.offTopic'
    };
    return map[slug] || slug;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">{t('forums.categoryNotFound')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Database Configuration Required</h3>
            <p className="text-yellow-700 mb-4">{error}</p>
            <p className="text-sm text-yellow-600 mb-4">
              Please run the SQL migration from FORUM_DATABASE_RELATIONSHIP_FIX.md in your Supabase SQL Editor.
            </p>
            <a 
              href="https://app.supabase.com/project/dieqhiezcpexkivklxcw/sql-editor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
            >
              Open Supabase SQL Editor
            </a>
          </div>
        </div>
      </div>
    );
  }

  const translationKey = getCategoryTranslation(category.slug);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/forums" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
            <ChevronLeft size={20} />
            <span>{t('forums.backToForums')}</span>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">
                {t(`${translationKey}.name`)}
              </h1>
              <p className="text-gray-600 text-lg">{t(`${translationKey}.description`)}</p>
            </div>
            <button
              onClick={() => {
                if (!user) {
                  alert(t('auth.pleaseSignIn'));
                  navigate('/forums/login');
                  return;
                }
                navigate(`/forums/category/${slug}/new`);
              }}
              className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition flex items-center gap-2"
            >
              <Plus size={20} />
              {t('forums.newThread')}
            </button>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-4">{t('forums.noThreads')}</p>
            <button
              onClick={() => {
                if (!user) {
                  alert(t('auth.pleaseSignIn'));
                  navigate('/forums/login');
                  return;
                }
                navigate(`/forums/category/${slug}/new`);
              }}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            >
              {t('forums.startFirst')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => {
              const author = authors[thread.author_id];
              return (
                <Link
                  key={thread.id}
                  to={`/forums/thread/${thread.id}`}
                  className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-black transition"
                >
                  <div className="flex items-start gap-4">
                    {author?.avatar_url ? (
                      <img
                        src={author.avatar_url}
                        alt={author.display_name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-bold">
                          {author?.display_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.pinned && <Pin size={16} className="text-black" />}
                        {thread.locked && <Lock size={16} className="text-gray-500" />}
                        <h3 className="text-lg font-bold text-black truncate">{thread.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {t('forums.by')} {author?.display_name || t('forums.unknown')} • {formatDate(thread.created_at)}
                      </p>
                      <p className="text-gray-700 line-clamp-2">{thread.content}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageSquare size={18} />
                        <span className="font-medium">{thread.reply_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
