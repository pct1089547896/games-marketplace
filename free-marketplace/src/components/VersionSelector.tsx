import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ContentVersion } from '../types';
import { Download, Clock, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VersionSelectorProps {
  contentId: string;
  contentType: 'game' | 'program';
  onDownload?: (version: ContentVersion) => void;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({ 
  contentId, 
  contentType,
  onDownload 
}) => {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [contentId, contentType]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVersions(data || []);
      
      // Select latest version by default
      const latestVersion = data?.find(v => v.is_latest) || data?.[0];
      if (latestVersion) {
        setSelectedVersion(latestVersion);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (version: ContentVersion) => {
    // Track download
    try {
      await supabase.rpc('track_download', {
        p_content_id: contentId,
        p_content_type: contentType,
        p_version_id: version.id
      });
    } catch (error) {
      console.error('Error tracking download:', error);
    }

    if (onDownload) {
      onDownload(version);
    } else {
      window.open(version.download_url, '_blank');
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1024 
      ? `${mb.toFixed(2)} MB` 
      : `${(mb / 1024).toFixed(2)} GB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
    );
  }

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Version Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <div className="font-semibold text-sm">
                Version {selectedVersion?.version_number}
                {selectedVersion?.is_latest && (
                  <span className="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Latest
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {selectedVersion && formatDate(selectedVersion.created_at)}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {versions.map((version) => (
              <button
                key={version.id}
                onClick={() => {
                  setSelectedVersion(version);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-200 dark:border-gray-700 last:border-0 ${
                  selectedVersion?.id === version.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">
                      Version {version.version_number}
                      {version.is_latest && (
                        <span className="ml-2 inline-block bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(version.created_at)} • {formatFileSize(version.file_size)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Version Details */}
      {selectedVersion && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">Changelog</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {selectedVersion.changelog}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>File Size: {formatFileSize(selectedVersion.file_size)}</span>
            <span>Released: {formatDate(selectedVersion.created_at)}</span>
          </div>

          {/* Download Button */}
          <button
            onClick={() => handleDownload(selectedVersion)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <Download className="w-5 h-5" />
            <span>Download Version {selectedVersion.version_number}</span>
          </button>
        </div>
      )}
    </div>
  );
};
