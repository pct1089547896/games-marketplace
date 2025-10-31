import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Lock, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ForumThread, ForumReply, UserProfile } from '../types';

export default function ThreadPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchThread();
      fetchReplies();
    }
  }, [id]);

  async function fetchThread() {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setThread(data);

      if (data) {
        await supabase
          .from('forum_threads')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);

        fetchUserProfile(data.author_id);
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReplies() {
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('thread_id', id)
        .is('parent_reply_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setReplies(data);
        
        const userIds = [...new Set(data.map(reply => reply.author_id))];
        userIds.forEach(userId => fetchUserProfile(userId));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  }

  async function fetchUserProfile(userId: string) {
    if (users[userId]) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUsers(prev => ({ ...prev, [userId]: data }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !thread || !replyContent.trim()) return;

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          thread_id: thread.id,
          content: replyContent.trim(),
          author_id: user.id,
          parent_reply_id: null
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setReplyContent('');
        fetchReplies();
      }
    } catch (err: any) {
      alert(err.message || t('forums.failedToPostReply'));
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">{t('forums.threadNotFound')}</div>
        </div>
      </div>
    );
  }

  const author = users[thread.author_id];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/forums" className="inline-flex items-center text-gray-600 hover:text-black mb-6">
          <ChevronLeft size={20} />
          <span>{t('forums.backToForums')}</span>
        </Link>

        <div className="bg-white p-8 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {thread.pinned && (
              <span className="inline-flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-xs font-medium">
                <Pin size={12} />
                {t('forums.pinned')}
              </span>
            )}
            {thread.locked && (
              <span className="inline-flex items-center gap-1 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                <Lock size={12} />
                {t('forums.locked')}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-black mb-6">{thread.title}</h1>

          <div className="flex items-start gap-4 mb-6">
            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.display_name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xl">
                  {author?.display_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <p className="font-bold text-black">{author?.display_name || t('forums.unknown')}</p>
              <p className="text-sm text-gray-600">{formatDate(thread.created_at)}</p>
              <p className="text-sm text-gray-500">{author?.post_count || 0} {t('forums.postCount')}</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
            <MessageSquare size={24} />
            {t('forums.replies')} ({replies.length})
          </h2>

          <div className="space-y-4">
            {replies.map((reply) => {
              const replyAuthor = users[reply.author_id];
              return (
                <div key={reply.id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-4">
                    {replyAuthor?.avatar_url ? (
                      <img
                        src={replyAuthor.avatar_url}
                        alt={replyAuthor.display_name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-bold">
                          {replyAuthor?.display_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-black">{replyAuthor?.display_name || t('forums.unknown')}</p>
                          <p className="text-sm text-gray-600">{formatDate(reply.created_at)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {thread.locked ? (
          <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 text-center">
            <Lock size={32} className="mx-auto text-gray-500 mb-2" />
            <p className="text-gray-600">{t('forums.threadLocked')}</p>
          </div>
        ) : user ? (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4">{t('forums.postReply')}</h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none mb-4"
                placeholder={t('forums.shareThoughts')}
              />
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('forums.posting') : t('forums.reply')}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg border border-gray-300 text-center">
            <p className="text-gray-600 mb-4">{t('auth.signInToParticipate')}</p>
            <button
              onClick={() => navigate('/forums/login')}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              {t('auth.signIn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
