import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { ForumCategory } from '../types';

export default function ForumsPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalThreads, setTotalThreads] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { count: threadsCount } = await supabase
        .from('forum_threads')
        .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      setTotalThreads(threadsCount || 0);
      setTotalUsers(usersCount || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">{t('forums.title')}</h1>
          <p className="text-gray-600 text-lg">{t('forums.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{t('forums.totalDiscussions')}</p>
                <p className="text-3xl font-bold text-black">{totalThreads}</p>
              </div>
              <MessageSquare className="text-gray-400" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{t('forums.communityMembers')}</p>
                <p className="text-3xl font-bold text-black">{totalUsers}</p>
              </div>
              <Users className="text-gray-400" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{t('forums.categories')}</p>
                <p className="text-3xl font-bold text-black">{categories.length}</p>
              </div>
              <TrendingUp className="text-gray-400" size={40} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((category) => {
            const translationKey = getCategoryTranslation(category.slug);
            return (
              <Link
                key={category.id}
                to={`/forums/category/${category.slug}`}
                className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-black transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-black mb-2">
                      {t(`${translationKey}.name`)}
                    </h3>
                    <p className="text-gray-600">{t(`${translationKey}.description`)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-black">{category.thread_count}</p>
                    <p className="text-sm text-gray-600">{t('forums.threads')}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
