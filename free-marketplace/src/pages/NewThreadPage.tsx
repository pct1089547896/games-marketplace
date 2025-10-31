import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ForumCategory } from '../types';

export default function NewThreadPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/forums/login');
      return;
    }
    if (slug) {
      fetchCategory();
    }
  }, [slug, user]);

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
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !category) return;

    setError('');
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: category.id,
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
          status: 'pending'
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating thread:', error);
        throw error;
      }

      if (data) {
        console.log('Thread created successfully:', data);
        navigate(`/forums/thread/${data.id}`);
      }
    } catch (err: any) {
      console.error('Failed to create thread:', err);
      setError(err.message || t('forums.failedToCreateThread'));
    } finally {
      setSubmitting(false);
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

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  const translationKey = getCategoryTranslation(category.slug);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to={`/forums/category/${slug}`}
          className="inline-flex items-center text-gray-600 hover:text-black mb-6"
        >
          <ChevronLeft size={20} />
          <span>{t('forums.backTo')} {t(`${translationKey}.name`)}</span>
        </Link>

        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <h1 className="text-3xl font-bold text-black mb-6">{t('forums.createThread')}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('forums.threadTitle')}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={t('forums.threadTitlePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                {t('forums.content')}
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder={t('forums.shareThoughts')}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('forums.creating') : t('forums.createThread')}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/forums/category/${slug}`)}
                className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                {t('forums.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
