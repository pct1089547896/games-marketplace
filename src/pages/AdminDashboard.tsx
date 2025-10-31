import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload,
  Gamepad2,
  Package,
  FileText,
  Eye,
  Download,
  Users,
  Shield,
  Star,
  Layers,
  Image,
  Megaphone,
  TrendingUp,
  GitBranch,
  Flag,
  Palette
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Game, Program, BlogPost } from '../types';
import AdminUserManagement from './AdminUserManagement';
import AdminForumModeration from './AdminForumModeration';
import AdminReviewManagement from './AdminReviewManagement';
import AdminCollectionsManagement from './AdminCollectionsManagement';
import AdminHeroManagement from './AdminHeroManagement';
import AdminAnnouncementManagement from './AdminAnnouncementManagement';
import AdminThemeManagement from './AdminThemeManagement';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminVersionManagement } from './AdminVersionManagement';
import { AdminReportsManagement } from './AdminReportsManagement';
import EnhancedRichTextEditor from '../components/EnhancedRichTextEditor';
import GalleryManager from '../components/GalleryManager';

type TabType = 'games' | 'programs' | 'blog' | 'users' | 'moderation' | 'reviews' | 'collections' | 'hero' | 'announcements' | 'analytics' | 'versions' | 'reports' | 'themes';

export default function AdminDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === 'games') {
        const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
        setGames(data || []);
      } else if (activeTab === 'programs') {
        const { data } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
        setPrograms(data || []);
      } else {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        setBlogPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const table = activeTab === 'blog' ? 'blog_posts' : activeTab;
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete item');
    }
  }

  function handleEdit(item: any) {
    setEditingItem(item);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingItem(null);
    setShowForm(true);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('admin.loading')}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
              <p className="text-gray-300 text-sm">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
            >
              <LogOut size={18} />
              {t('admin.signOut')}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('games'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'games'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Gamepad2 size={20} />
            {t('admin.games')}
          </button>
          <button
            onClick={() => { setActiveTab('programs'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'programs'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Package size={20} />
            {t('admin.programs')}
          </button>
          <button
            onClick={() => { setActiveTab('blog'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'blog'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <FileText size={20} />
            {t('admin.blogPosts')}
          </button>
          <button
            onClick={() => { setActiveTab('users'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Users size={20} />
            {t('admin.userManagement')}
          </button>
          <button
            onClick={() => { setActiveTab('moderation'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Shield size={20} />
            {t('admin.forumModeration')}
          </button>
          <button
            onClick={() => { setActiveTab('reviews'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Star size={20} />
            {t('admin.reviewManagement')}
          </button>
          <button
            onClick={() => { setActiveTab('collections'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'collections'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Layers size={20} />
            {t('admin.collectionsManagement')}
          </button>
          <button
            onClick={() => { setActiveTab('hero'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'hero'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Image size={20} />
            {t('admin.heroManagement')}
          </button>
          <button
            onClick={() => { setActiveTab('announcements'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Megaphone size={20} />
            {t('admin.announcements')}
          </button>
          <button
            onClick={() => { setActiveTab('analytics'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <TrendingUp size={20} />
            Analytics
          </button>
          <button
            onClick={() => { setActiveTab('versions'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'versions'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <GitBranch size={20} />
            Versions
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Flag size={20} />
            Reports
          </button>
          <button
            onClick={() => { setActiveTab('themes'); setShowForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'themes'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Palette size={20} />
            Themes
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'users' ? (
          <AdminUserManagement />
        ) : activeTab === 'moderation' ? (
          <AdminForumModeration />
        ) : activeTab === 'reviews' ? (
          <AdminReviewManagement />
        ) : activeTab === 'collections' ? (
          <AdminCollectionsManagement />
        ) : activeTab === 'hero' ? (
          <AdminHeroManagement />
        ) : activeTab === 'announcements' ? (
          <AdminAnnouncementManagement />
        ) : activeTab === 'analytics' ? (
          <AdminAnalytics />
        ) : activeTab === 'versions' ? (
          <AdminVersionManagement />
        ) : activeTab === 'reports' ? (
          <AdminReportsManagement />
        ) : activeTab === 'themes' ? (
          <AdminThemeManagement />
        ) : (
          <>
            {/* Add Button */}
            {!showForm && (
              <button
                onClick={handleAdd}
                className="mb-6 flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
              >
                <Plus size={20} />
                {t('admin.addNew')} {activeTab === 'blog' ? t('admin.post') : activeTab.slice(0, -1)}
              </button>
            )}

            {/* Form or List */}
            {showForm ? (
              <ContentForm
                type={activeTab as 'games' | 'programs' | 'blog'}
                item={editingItem}
                onClose={() => { setShowForm(false); setEditingItem(null); }}
                onSave={() => { fetchData(); setShowForm(false); setEditingItem(null); }}
              />
            ) : loading ? (
              <div className="text-center py-12 text-gray-600">{t('admin.loading')}</div>
            ) : (
              <ContentList
                type={activeTab as 'games' | 'programs' | 'blog'}
                items={activeTab === 'games' ? games : activeTab === 'programs' ? programs : blogPosts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Content List Component
function ContentList({ 
  type, 
  items, 
  onEdit, 
  onDelete 
}: { 
  type: TabType; 
  items: any[]; 
  onEdit: (item: any) => void; 
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-600">No {type} yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              {type !== 'blog' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloads
                  </th>
                </>
              )}
              {type === 'blog' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {item.description || item.content?.substring(0, 50)}
                  </div>
                </td>
                {type !== 'blog' && (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.category || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        {item.view_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Download size={14} />
                        {item.download_count || 0}
                      </div>
                    </td>
                  </>
                )}
                {type === 'blog' && (
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.author || '-'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Content Form Component
function ContentForm({ 
  type, 
  item, 
  onClose, 
  onSave 
}: { 
  type: TabType; 
  item: any; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState(item || {});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const bucketName = type === 'games' ? 'game-images' : type === 'programs' ? 'program-images' : 'blog-images';
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        console.log('Uploading image to bucket:', bucketName, 'filename:', fileName);

        const { data, error } = await supabase.functions.invoke('image-upload', {
          body: { imageData: base64Data, fileName, bucketName }
        });

        console.log('Image upload result:', { data, error });

        if (error) {
          console.error('Image upload error:', error);
          throw new Error(`Upload failed: ${error.message}`);
        }

        if (!data || !data.data || !data.data.publicUrl) {
          throw new Error('Invalid response from upload service');
        }

        if (type === 'blog') {
          setFormData({ ...formData, featured_image: data.data.publicUrl });
        } else {
          const screenshots = formData.screenshots || [];
          setFormData({ ...formData, screenshots: [...screenshots, data.data.publicUrl] });
        }

        alert('Image uploaded successfully!');
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.title.trim()) {
        alert('Title is required');
        return;
      }

      // Prepare data based on content type
      const table = type === 'blog' ? 'blog_posts' : type;
      let insertData = { ...formData };

      if (type !== 'blog') {
        // For games/programs, ensure required fields
        if (!formData.description || !formData.description.trim()) {
          alert('Description is required');
          return;
        }
        if (!formData.download_link || !formData.download_link.trim()) {
          alert('Download link is required');
          return;
        }
        
        // Ensure arrays are properly initialized
        insertData.screenshots = insertData.screenshots || [];
      }

      if (type === 'blog') {
        // For blog posts, ensure content and author
        if (!formData.content || !formData.content.trim()) {
          alert('Content is required');
          return;
        }
        if (!formData.author || !formData.author.trim()) {
          insertData.author = 'Admin'; // Default author if not provided
        }
        insertData.is_published = insertData.is_published !== false; // Default to published
      }
      
      console.log('Saving to table:', table);
      console.log('Insert data:', insertData);
      
      let result;
      if (item?.id) {
        // Update
        console.log('Updating item with ID:', item.id);
        result = await supabase.from(table).update(insertData).eq('id', item.id);
      } else {
        // Insert
        console.log('Inserting new item');
        result = await supabase.from(table).insert([insertData]);
      }

      console.log('Supabase result:', result);

      if (result.error) {
        console.error('Database error:', result.error);
        alert(`Database Error: ${result.error.message}`);
        return;
      }

      if (result.data && result.data.length > 0) {
        console.log('Save successful:', result.data);
        alert(`${type === 'blog' ? 'Blog post' : type.slice(0, -1)} saved successfully!`);
        onSave();
      } else if (result.data) {
        console.log('Save successful:', result.data);
        alert('Content saved successfully!');
        onSave();
      } else {
        console.warn('No data returned from save operation');
        alert('Saved successfully, but no confirmation data received.');
        onSave();
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-6">
        {item ? 'Edit' : 'Add New'} {type === 'blog' ? 'Post' : type.slice(0, -1)}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {type !== 'blog' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <EnhancedRichTextEditor
                value={formData.description || ''}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter detailed description with formatting..."
                minHeight="250px"
                contentType={type as 'games' | 'programs'}
                bucketName={type === 'games' ? 'game-images' : 'program-images'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Download Link</label>
              <input
                type="url"
                value={formData.download_link || ''}
                onChange={(e) => setFormData({ ...formData, download_link: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>
          </>
        )}

        {type === 'blog' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <EnhancedRichTextEditor
                value={formData.content || ''}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Write your blog post content with rich formatting..."
                minHeight="400px"
                contentType="blog"
                bucketName="blog-images"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
              <input
                type="text"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_published !== false}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>

            {/* Gallery Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Layout
              </label>
              <select
                value={formData.gallery_layout || 'grid'}
                onChange={(e) => setFormData({ ...formData, gallery_layout: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="grid">Grid - Classic photo grid layout</option>
                <option value="carousel">Carousel - Slideshow with navigation</option>
                <option value="masonry">Masonry - Pinterest-style waterfall</option>
                <option value="slideshow">Slideshow - Auto-advancing presentation</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how gallery images are displayed on the detail page
              </p>
            </div>
          </>
        )}

        {type !== 'blog' && (
          <>
            {/* Gallery Layout Selection for Games/Programs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Layout
              </label>
              <select
                value={formData.gallery_layout || 'grid'}
                onChange={(e) => setFormData({ ...formData, gallery_layout: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="grid">Grid - Classic photo grid layout</option>
                <option value="carousel">Carousel - Slideshow with navigation</option>
                <option value="masonry">Masonry - Pinterest-style waterfall</option>
                <option value="slideshow">Slideshow - Auto-advancing presentation</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how gallery images are displayed on the detail page
              </p>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type === 'blog' ? 'Featured Image' : 'Screenshots'}
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <Upload size={18} />
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          
          {type === 'blog' && formData.featured_image && (
            <img src={formData.featured_image} alt="Preview" className="mt-4 w-48 h-32 object-cover rounded" />
          )}
          
          {type !== 'blog' && formData.screenshots && formData.screenshots.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {formData.screenshots.map((url: string, index: number) => (
                <div key={index} className="relative">
                  <img src={url} alt={`Screenshot ${index + 1}`} className="w-32 h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      const screenshots = formData.screenshots.filter((_: any, i: number) => i !== index);
                      setFormData({ ...formData, screenshots });
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Manager - Only for existing items */}
        {item?.id && (
          <div className="border-t border-gray-200 pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Image Gallery</h3>
              <p className="text-sm text-gray-600">Manage multiple images for this {type === 'blog' ? 'post' : type.slice(0, -1)}</p>
            </div>
            <GalleryManager
              postId={item.id}
              postType={type === 'games' ? 'game' : type === 'programs' ? 'program' : 'blog'}
              onGalleryUpdate={() => {
                // Optional: refresh or update parent state if needed
                console.log('Gallery updated');
              }}
            />
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
