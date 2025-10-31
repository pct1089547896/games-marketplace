import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff, 
  Megaphone,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_enabled: boolean;
  show_icon: boolean;
  is_dismissible: boolean;
  link_url?: string;
  link_text?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminAnnouncementManagement() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    is_enabled: false,
    show_icon: true,
    is_dismissible: true,
    link_url: '',
    link_text: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        link_url: formData.link_url || null,
        link_text: formData.link_text || null,
        updated_at: new Date().toISOString()
      };

      if (editingItem) {
        const { error } = await supabase
          .from('announcements')
          .update(dataToSubmit)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([dataToSubmit]);

        if (error) throw error;
      }

      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    }
  }

  async function handleToggleEnabled(id: string, currentState: boolean) {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ 
          is_enabled: !currentState,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  }

  function handleEdit(item: Announcement) {
    setEditingItem(item);
    setFormData({
      title: item.title,
      message: item.message,
      type: item.type,
      is_enabled: item.is_enabled,
      show_icon: item.show_icon,
      is_dismissible: item.is_dismissible,
      link_url: item.link_url || '',
      link_text: item.link_text || ''
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      is_enabled: false,
      show_icon: true,
      is_dismissible: true,
      link_url: '',
      link_text: ''
    });
    setEditingItem(null);
    setShowForm(false);
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'info': return <Info size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      default: return <Info size={20} />;
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'success': return 'bg-green-100 text-green-800 border-green-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Megaphone size={32} />
          <h1 className="text-3xl font-bold">{t('admin.announcements')}</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
        >
          <Plus size={20} />
          {t('admin.createAnnouncement')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">
            {editingItem ? t('admin.editAnnouncement') : t('admin.createAnnouncement')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('admin.announcementTitle')} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('admin.announcementMessage')} *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('admin.announcementType')}
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="info">{t('admin.typeInfo')}</option>
                <option value="success">{t('admin.typeSuccess')}</option>
                <option value="warning">{t('admin.typeWarning')}</option>
                <option value="error">{t('admin.typeError')}</option>
              </select>
            </div>

            {/* Link (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('admin.linkUrl')} ({t('common.optional')})
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('admin.linkText')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  value={formData.link_text}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder={t('admin.learnMore')}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_enabled}
                  onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">{t('admin.enableAnnouncement')}</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.show_icon}
                  onChange={(e) => setFormData({ ...formData, show_icon: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">{t('admin.showIcon')}</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_dismissible}
                  onChange={(e) => setFormData({ ...formData, is_dismissible: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-medium">{t('admin.allowDismiss')}</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                {editingItem ? t('common.update') : t('common.create')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Megaphone size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl">{t('admin.noAnnouncements')}</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`border-2 rounded-lg p-6 ${getTypeColor(announcement.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {announcement.show_icon && getTypeIcon(announcement.type)}
                    <h3 className="text-xl font-bold">{announcement.title}</h3>
                    {announcement.is_enabled ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {t('admin.active')}
                      </span>
                    ) : (
                      <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {t('admin.inactive')}
                      </span>
                    )}
                  </div>
                  <p className="mb-3">{announcement.message}</p>
                  {announcement.link_url && announcement.link_text && (
                    <a
                      href={announcement.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium underline"
                    >
                      {announcement.link_text}
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <div className="text-sm mt-3 opacity-75">
                    {t('admin.created')}: {new Date(announcement.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleEnabled(announcement.id, announcement.is_enabled)}
                    className={`p-2 rounded-lg transition ${
                      announcement.is_enabled
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-green-600 text-white hover:bg-green-500'
                    }`}
                    title={announcement.is_enabled ? t('admin.disable') : t('admin.enable')}
                  >
                    {announcement.is_enabled ? <PowerOff size={20} /> : <Power size={20} />}
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                    title={t('common.edit')}
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                    title={t('common.delete')}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
