import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Trash2, 
  Pin, 
  Lock, 
  Unlock,
  Flag,
  CheckSquare,
  Square,
  ChevronLeft,
  MessageSquare,
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  view_count: number;
  reply_count: number;
  pinned: boolean;
  locked: boolean;
  status: string;
  is_flagged: boolean;
  flagged_reason: string | null;
  created_at: string;
}

interface ForumReply {
  id: string;
  thread_id: string;
  content: string;
  author_id: string;
  status: string;
  is_flagged: boolean;
  flagged_reason: string | null;
  created_at: string;
}

type TabType = 'threads' | 'replies';

export default function AdminForumModeration() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('threads');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [authors, setAuthors] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    filterItems();
  }, [threads, replies, searchQuery, statusFilter, activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === 'threads') {
        const { data, error } = await supabase
          .from('forum_threads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setThreads(data || []);

        if (data && data.length > 0) {
          await fetchAuthors(data.map(t => t.author_id));
        }
      } else {
        const { data, error } = await supabase
          .from('forum_replies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReplies(data || []);

        if (data && data.length > 0) {
          await fetchAuthors(data.map(r => r.author_id));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAuthors(authorIds: string[]) {
    try {
      const uniqueIds = [...new Set(authorIds)];
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url')
        .in('id', uniqueIds);

      if (error) throw error;

      const authorsMap: Record<string, any> = {};
      data?.forEach(author => {
        authorsMap[author.id] = author;
      });
      setAuthors(authorsMap);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  }

  function filterItems() {
    let filtered: any[] = activeTab === 'threads' ? threads : replies;

    if (statusFilter !== 'all') {
      if (statusFilter === 'flagged') {
        filtered = filtered.filter((item: any) => item.is_flagged) as any[];
      } else {
        filtered = filtered.filter((item: any) => item.status === statusFilter) as any[];
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) =>
        item.title?.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query)
      ) as any[];
    }

    setFilteredItems(filtered as ForumThread[] | ForumReply[]);
  }

  function toggleItemSelection(itemId: string) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  }

  function toggleSelectAll() {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item: any) => item.id)));
    }
  }

  async function handleTogglePin(threadId: string, currentPinned: boolean) {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ pinned: !currentPinned })
        .eq('id', threadId);

      if (error) throw error;

      await supabase.from('admin_logs').insert({
        admin_id: user!.id,
        action: currentPinned ? 'unpin_thread' : 'pin_thread',
        target_type: 'thread',
        target_id: threadId,
        details: {}
      });

      alert(t('admin.statusUpdatedSuccess'));
      fetchData();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert(t('common.error'));
    }
  }

  async function handleToggleLock(threadId: string, currentLocked: boolean) {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ locked: !currentLocked })
        .eq('id', threadId);

      if (error) throw error;

      await supabase.from('admin_logs').insert({
        admin_id: user!.id,
        action: currentLocked ? 'unlock_thread' : 'lock_thread',
        target_type: 'thread',
        target_id: threadId,
        details: {}
      });

      alert(t('admin.statusUpdatedSuccess'));
      fetchData();
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert(t('common.error'));
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm(t('admin.deleteConfirmation'))) return;

    try {
      const table = activeTab === 'threads' ? 'forum_threads' : 'forum_replies';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await supabase.from('admin_logs').insert({
        admin_id: user!.id,
        action: `delete_${activeTab === 'threads' ? 'thread' : 'reply'}`,
        target_type: activeTab === 'threads' ? 'thread' : 'reply',
        target_id: itemId,
        details: {}
      });

      alert(activeTab === 'threads' ? t('admin.threadDeletedSuccess') : t('admin.replyDeletedSuccess'));
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert(t('common.error'));
    }
  }

  async function handleBulkDelete() {
    if (selectedItems.size === 0) return;
    if (!confirm(t('admin.bulkDeleteConfirmation', { count: selectedItems.size }))) return;

    try {
      const table = activeTab === 'threads' ? 'forum_threads' : 'forum_replies';
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      for (const itemId of selectedItems) {
        await supabase.from('admin_logs').insert({
          admin_id: user!.id,
          action: `bulk_delete_${activeTab === 'threads' ? 'thread' : 'reply'}`,
          target_type: activeTab === 'threads' ? 'thread' : 'reply',
          target_id: itemId,
          details: {}
        });
      }

      alert(activeTab === 'threads' ? t('admin.threadDeletedSuccess') : t('admin.replyDeletedSuccess'));
      setSelectedItems(new Set());
      fetchData();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert(t('common.error'));
    }
  }

  async function handleUpdateStatus(itemId: string, newStatus: string) {
    try {
      const table = activeTab === 'threads' ? 'forum_threads' : 'forum_replies';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;

      await supabase.from('admin_logs').insert({
        admin_id: user!.id,
        action: 'update_status',
        target_type: activeTab === 'threads' ? 'thread' : 'reply',
        target_id: itemId,
        details: { new_status: newStatus }
      });

      alert(t('admin.statusUpdatedSuccess'));
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(t('common.error'));
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('admin.loading')}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition"
            >
              <ChevronLeft size={20} />
              {t('admin.back')}
            </button>
            <h1 className="text-2xl font-bold">{t('admin.forumModeration')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('threads'); setSelectedItems(new Set()); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'threads'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <MessageSquare size={20} />
            {t('admin.threads')}
          </button>
          <button
            onClick={() => { setActiveTab('replies'); setSelectedItems(new Set()); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'replies'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <MessageSquare size={20} />
            {t('admin.replies')}
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('admin.searchThreads')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">{t('admin.all')}</option>
              <option value="pending">{t('admin.pending')}</option>
              <option value="published">{t('admin.published')}</option>
              <option value="draft">{t('admin.draft')}</option>
              <option value="spam">{t('admin.spam')}</option>
              <option value="flagged">{t('admin.flaggedContent')}</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.size} {t('admin.selected')}
              </span>
            </div>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 size={18} />
              {t('admin.deleteSelected')}
            </button>
          </div>
        )}

        {/* Content Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-600 hover:text-black transition"
                    >
                      {selectedItems.size === filteredItems.length ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'threads' ? t('admin.threadTitle') : t('admin.content')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.author')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.status')}
                  </th>
                  {activeTab === 'threads' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('admin.replies')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('admin.views')}
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.created')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'threads' ? 8 : 6} className="px-6 py-12 text-center text-gray-500">
                      {activeTab === 'threads' ? t('admin.noThreadsFound') : t('admin.noRepliesFound')}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleItemSelection(item.id)}
                          className="text-gray-600 hover:text-black transition"
                        >
                          {selectedItems.has(item.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          {item.is_flagged && (
                            <Flag size={16} className="text-red-500 flex-shrink-0 mt-1" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {item.title || item.content?.substring(0, 60) + '...'}
                            </div>
                            {item.is_flagged && item.flagged_reason && (
                              <div className="text-xs text-red-600 mt-1">
                                {item.flagged_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {authors[item.author_id]?.display_name || t('forums.unknown')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                        >
                          <option value="pending">{t('admin.pending')}</option>
                          <option value="published">{t('admin.published')}</option>
                          <option value="draft">{t('admin.draft')}</option>
                          <option value="spam">{t('admin.spam')}</option>
                        </select>
                      </td>
                      {activeTab === 'threads' && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MessageSquare size={14} />
                              {item.reply_count || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Eye size={14} />
                              {item.view_count || 0}
                            </div>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {activeTab === 'threads' && (
                            <>
                              <button
                                onClick={() => handleTogglePin(item.id, item.pinned)}
                                className={`p-2 rounded transition ${
                                  item.pinned
                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                title={item.pinned ? t('admin.unpin') : t('admin.pin')}
                              >
                                <Pin size={18} />
                              </button>
                              <button
                                onClick={() => handleToggleLock(item.id, item.locked)}
                                className={`p-2 rounded transition ${
                                  item.locked
                                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                title={item.locked ? t('admin.unlock') : t('admin.lock')}
                              >
                                {item.locked ? <Lock size={18} /> : <Unlock size={18} />}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title={t('admin.delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Count */}
        <div className="mt-4 text-sm text-gray-600">
          {t('admin.showing')} {filteredItems.length} {t('admin.of')} {activeTab === 'threads' ? threads.length : replies.length} {activeTab === 'threads' ? t('admin.threads') : t('admin.replies')}
        </div>
      </div>
    </div>
  );
}
