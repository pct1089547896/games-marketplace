import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert: (url: string) => void;
  bucketName: string;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onImageInsert,
  bucketName
}: ImageUploadModalProps) {
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions: 1920x1080
          const maxWidth = 1920;
          const maxHeight = 1080;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Compress image
      const compressedFile = await compressImage(file);

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      onImageInsert(publicUrl);
      handleClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleUrlInsert = () => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }
    onImageInsert(imageUrl);
    handleClose();
  };

  const handleClose = () => {
    setImageUrl('');
    setPreview(null);
    setError(null);
    setDragActive(false);
    setUploadMode('upload');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Insert Image</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setUploadMode('upload')}
            className={`flex-1 py-3 px-4 font-medium transition ${
              uploadMode === 'upload'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload size={18} className="inline mr-2" />
            Upload
          </button>
          <button
            onClick={() => setUploadMode('url')}
            className={`flex-1 py-3 px-4 font-medium transition ${
              uploadMode === 'url'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LinkIcon size={18} className="inline mr-2" />
            URL
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {uploadMode === 'upload' ? (
            <div>
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  dragActive
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded"
                    />
                    {uploading && (
                      <div className="text-sm text-gray-600">
                        Uploading and compressing...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon size={48} className="mx-auto text-gray-400" />
                    <div>
                      <p className="text-gray-700 font-medium mb-2">
                        Drag and drop an image here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">or</p>
                      <label className="inline-block bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Max 10MB • JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                onClick={handleUrlInsert}
                className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Insert Image
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
