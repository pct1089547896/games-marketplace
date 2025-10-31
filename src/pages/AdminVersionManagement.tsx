import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ContentVersion, Game, Program } from '../types';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AdminVersionManagement: React.FC = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<(Game | Program)[]>([]);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'game' | 'program'>('game');
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    version_number: '',
    changelog: '',
    download_url: '',
    file_size: '',
    is_latest: false
  });

  useEffect(() => {
    loadContent();
  }, [contentType]);

  useEffect(() => {
    if (selectedContent) {
      loadVersions();
    }
  }, [selectedContent]);

  const loadContent = async () => {
    const table = contentType === 'game' ? 'games' : 'programs';
    const { data } = await supabase
      .from(table)
      .select('*')
      .order('title');
    setContent(data || []);
  };

  const loadVersions = async () => {
    if (!selectedContent) return;

    const { data } = await supabase
      .from('content_versions')
      .select('*')
      .eq('content_id', selectedContent)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false });

    setVersions(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_versions')
        .insert({
          content_id: selectedContent,
          content_type: contentType,
          version_number: formData.version_number,
          changelog: formData.changelog,
          download_url: formData.download_url,
          file_size: formData.file_size ? parseInt(formData.file_size) : null,
          is_latest: formData.is_latest
        });

      if (error) throw error;

      setFormData({
        version_number: '',
        changelog: '',
        download_url: '',
        file_size: '',
        is_latest: false
      });
      setIsAddingVersion(false);
      loadVersions();
      alert('Version added successfully!');
    } catch (error) {
      console.error('Error adding version:', error);
      alert('Failed to add version');
    } finally {
      setLoading(false);
    }
  };

  const toggleLatest = async (versionId: string, currentLatest: boolean) => {
    try {
      const { error } = await supabase
        .from('content_versions')
        .update({ is_latest: !currentLatest })
        .eq('id', versionId);

      if (error) throw error;
      loadVersions();
    } catch (error) {
      console.error('Error updating version:', error);
    }
  };

  const deleteVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return;

    try {
      const { error } = await supabase
        .from('content_versions')
        .delete()
        .eq('id', versionId);

      if (error) throw error;
      loadVersions();
    } catch (error) {
      console.error('Error deleting version:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Version Management</h2>

      {/* Content Type Toggle */}
      <div className="flex space-x-4">
        <button
          onClick={() => setContentType('game')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            contentType === 'game'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Games
        </button>
        <button
          onClick={() => setContentType('program')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            contentType === 'program'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Programs
        </button>
      </div>

      {/* Content Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Content</label>
        <select
          value={selectedContent || ''}
          onChange={(e) => setSelectedContent(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose {contentType}...</option>
          {content.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      {selectedContent && (
        <>
          {/* Add Version Button */}
          <div>
            <button
              onClick={() => setIsAddingVersion(!isAddingVersion)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Version</span>
            </button>
          </div>

          {/* Add Version Form */}
          {isAddingVersion && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Add New Version</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Version Number</label>
                    <input
                      type="text"
                      value={formData.version_number}
                      onChange={(e) => setFormData({ ...formData, version_number: e.target.value })}
                      placeholder="e.g., 1.2.0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">File Size (bytes)</label>
                    <input
                      type="number"
                      value={formData.file_size}
                      onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                      placeholder="e.g., 52428800"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Download URL</label>
                  <input
                    type="url"
                    value={formData.download_url}
                    onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Changelog</label>
                  <textarea
                    value={formData.changelog}
                    onChange={(e) => setFormData({ ...formData, changelog: e.target.value })}
                    placeholder="What's new in this version..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_latest"
                    checked={formData.is_latest}
                    onChange={(e) => setFormData({ ...formData, is_latest: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_latest" className="text-sm font-medium">
                    Mark as latest version
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Version'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingVersion(false)}
                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 px-6 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Versions List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Existing Versions</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {versions.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No versions yet. Add one above.
                </div>
              ) : (
                versions.map((version) => (
                  <div key={version.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-lg">v{version.version_number}</span>
                          {version.is_latest && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mb-2">
                          {version.changelog}
                        </p>
                        <div className="text-xs text-gray-500 space-x-4">
                          <span>Released: {new Date(version.created_at).toLocaleDateString()}</span>
                          {version.file_size && (
                            <span>Size: {(version.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleLatest(version.id, version.is_latest)}
                          className={`p-2 rounded-lg transition ${
                            version.is_latest
                              ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={version.is_latest ? 'Unmark as latest' : 'Mark as latest'}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteVersion(version.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Delete version"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
