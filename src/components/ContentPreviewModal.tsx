import { X, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';
import RichContentRenderer from './RichContentRenderer';

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
}

export default function ContentPreviewModal({
  isOpen,
  onClose,
  content,
  title = 'Content Preview'
}: ContentPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{title}</h2>
            
            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white border rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition ${
                  viewMode === 'desktop'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Monitor size={16} />
                <span className="text-sm font-medium">Desktop</span>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition ${
                  viewMode === 'mobile'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Smartphone size={16} />
                <span className="text-sm font-medium">Mobile</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
          <div
            className={`bg-white rounded-lg shadow-lg mx-auto transition-all duration-300 ${
              viewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
            }`}
          >
            <div className="p-8">
              {content ? (
                <RichContentRenderer content={content} />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">No content to preview</p>
                  <p className="text-sm mt-2">Start typing to see your content here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Preview shows how your content will appear on the live website
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
