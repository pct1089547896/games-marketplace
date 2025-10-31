import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { FeaturedCollection, Game, Program } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Search,
  Package,
  Gamepad2,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';

interface CollectionFormData {
  name: string;
  description: string;
  collection_type: 'game' | 'program' | 'mixed';
  is_active: boolean;
  display_order: number;
  content_items: string[];
}

const AdminCollectionsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [availableContent, setAvailableContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<FeaturedCollection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    description: '',
    collection_type: 'mixed',
    is_active: true,
    display_order: 0,
    content_items: []
  });

  useEffect(() => {
    fetchCollections();
    fetchAvailableContent();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('featured_collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchAvailableContent = async () => {
    try {
      const [gamesResult, programsResult] = await Promise.all([
        supabase.from('games').select('id, title, category, screenshots').eq('is_verified', true),
        supabase.from('programs').select('id, title, category, screenshots').eq('is_verified', true)
      ]);

      const content = [
        ...(gamesResult.data || []).map(item => ({ ...item, type: 'game' as const })),
        ...(programsResult.data || []).map(item => ({ ...item, type: 'program' as const }))
      ];

      setAvailableContent(content);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      collection_type: 'mixed',
      is_active: true,
      display_order: collections.length,
      content_items: []
    });
    setEditingCollection(null);
    setShowForm(false);
  };

  const handleEdit = (collection: FeaturedCollection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description,
      collection_type: collection.collection_type,
      is_active: collection.is_active,
      display_order: collection.display_order,
      content_items: Array.isArray(collection.content_items) 
        ? collection.content_items.map(item => typeof item === 'string' ? item : item.id)
        : []
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const collectionData = {
        ...formData,
        content_items: formData.content_items
      };

      if (editingCollection) {
        const { error } = await supabase
          .from('featured_collections')
          .update(collectionData)
          .eq('id', editingCollection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('featured_collections')
          .insert([collectionData]);

        if (error) throw error;
      }

      await fetchCollections();
      resetForm();
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDeleteCollection'))) return;

    try {
      const { error } = await supabase
        .from('featured_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const toggleContentItem = (contentId: string) => {
    setFormData(prev => ({
      ...prev,
      content_items: prev.content_items.includes(contentId)
        ? prev.content_items.filter(id => id !== contentId)
        : [...prev.content_items, contentId]
    }));
  };

  const toggleCollectionStatus = async (collection: FeaturedCollection) => {
    try {
      const { error } = await supabase
        .from('featured_collections')
        .update({ is_active: !collection.is_active })
        .eq('id', collection.id);

      if (error) throw error;
      await fetchCollections();
    } catch (error) {
      console.error('Error updating collection status:', error);
    }
  };

  const filteredContent = availableContent.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="w-4 h-4" />;
      case 'program':
        return <Package className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
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
          {t('admin.collectionsManagement')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.newCollection')}</span>
        </button>
      </div>

      {/* Collections List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        {collections.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('admin.noCollections')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.noCollectionsDescription')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {collections.map((collection) => (
              <div key={collection.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {collection.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        collection.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {collection.is_active ? t('admin.active') : t('admin.inactive')}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getContentTypeIcon(collection.collection_type)}
                        <span className="ml-1">{t(`admin.${collection.collection_type}`)}</span>
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {collection.description}
                    </p>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-500 space-x-4">
                      <span>{t('admin.displayOrder')}: {collection.display_order}</span>
                      <span>
                        {t('admin.items')}: {
                          Array.isArray(collection.content_items) 
                            ? collection.content_items.length 
                            : 0
                        }
                      </span>
                      <span>
                        {t('admin.created')}: {new Date(collection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleCollectionStatus(collection)}
                      className={`p-2 rounded ${
                        collection.is_active
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={collection.is_active ? t('admin.deactivate') : t('admin.activate')}
                    >
                      {collection.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(collection)}
                      className="p-2 text-blue-600 hover:text-blue-700"
                      title={t('admin.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                      title={t('admin.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCollection ? t('admin.editCollection') : t('admin.newCollection')}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Collection Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.collectionName')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('admin.collectionNamePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={t('admin.collectionDescriptionPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.collectionType')}
                    </label>
                    <select
                      value={formData.collection_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, collection_type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="mixed">{t('admin.mixed')}</option>
                      <option value="game">{t('admin.game')}</option>
                      <option value="program">{t('admin.program')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('admin.displayOrder')}
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.activeCollection')}
                  </label>
                </div>
              </div>

              {/* Content Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.selectContent')} ({formData.content_items.length} {t('admin.selected')})
                  </label>
                  
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('admin.searchContent')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-60 overflow-y-auto">
                    {filteredContent.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          formData.content_items.includes(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => toggleContentItem(item.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.content_items.includes(item.id)}
                            onChange={() => toggleContentItem(item.id)}
                            className="h-4 w-4 text-black dark:text-white border-gray-300 dark:border-gray-600 rounded"
                          />
                          {getContentTypeIcon((item as any).type)}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {item.category} • {(item as any).type}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredContent.length === 0 && (
                      <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                        {t('admin.noContentFound')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{editingCollection ? t('admin.updateCollection') : t('admin.createCollection')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectionsManagement;