import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, GripVertical, Edit2, Save, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PostImage {
  id: string;
  post_id: string;
  post_type: 'game' | 'program' | 'blog';
  image_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
  created_at: string;
}

interface GalleryManagerProps {
  postId: string;
  postType: 'game' | 'program' | 'blog';
  onGalleryUpdate?: () => void;
}

export default function GalleryManager({ postId, postType, onGalleryUpdate }: GalleryManagerProps) {
  const [images, setImages] = useState<PostImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ alt_text: string; caption: string }>({
    alt_text: '',
    caption: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [postId]);

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from('post_images')
        .select('*')
        .eq('post_id', postId)
        .eq('post_type', postType)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedImages: PostImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`${file.name} is too large (max 10MB)`);
          continue;
        }

        // Compress and resize image
        const compressedFile = await compressImage(file);
        
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${postType}/${postId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(fileName);

        // Create thumbnail
        const thumbnailFile = await createThumbnail(compressedFile);
        const thumbnailFileName = fileName.replace(/\.[^.]+$/, '_thumb.$&');
        
        const { data: thumbUploadData } = await supabase.storage
          .from('gallery-images')
          .upload(thumbnailFileName, thumbnailFile);

        const thumbnailUrl = thumbUploadData
          ? supabase.storage.from('gallery-images').getPublicUrl(thumbnailFileName).data.publicUrl
          : null;

        // Save to database
        const { data: imageData, error: dbError } = await supabase
          .from('post_images')
          .insert({
            post_id: postId,
            post_type: postType,
            image_url: publicUrl,
            thumbnail_url: thumbnailUrl,
            alt_text: file.name.replace(/\.[^.]+$/, ''),
            caption: '',
            display_order: images.length + uploadedImages.length
          })
          .select()
          .single();

        if (dbError) throw dbError;
        uploadedImages.push(imageData);
      }

      setImages([...images, ...uploadedImages]);
      if (onGalleryUpdate) onGalleryUpdate();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions
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

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
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
  }

  async function createThumbnail(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 300; // Thumbnail size

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > size) {
              height *= size / width;
              width = size;
            }
          } else {
            if (height > size) {
              width *= size / height;
              height = size;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], `thumb_${file.name}`, { type: 'image/jpeg' }));
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleDelete(imageId: string, imageUrl: string) {
    if (!confirm('Delete this image?')) return;

    try {
      // Delete from storage
      const path = imageUrl.split('/').slice(-3).join('/'); // Extract path from URL
      await supabase.storage.from('gallery-images').remove([path]);

      // Delete thumbnail
      const thumbPath = path.replace(/\.[^.]+$/, '_thumb.$&');
      await supabase.storage.from('gallery-images').remove([thumbPath]);

      // Delete from database
      await supabase.from('post_images').delete().eq('id', imageId);

      setImages(images.filter(img => img.id !== imageId));
      if (onGalleryUpdate) onGalleryUpdate();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update display_order for all images
    const updates = newImages.map((img, index) => ({
      id: img.id,
      display_order: index
    }));

    setImages(newImages);

    try {
      for (const update of updates) {
        await supabase
          .from('post_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      if (onGalleryUpdate) onGalleryUpdate();
    } catch (error) {
      console.error('Error reordering images:', error);
      fetchImages(); // Revert on error
    }
  }

  async function handleSaveMetadata() {
    if (!editingImage) return;

    try {
      await supabase
        .from('post_images')
        .update({
          alt_text: editValues.alt_text,
          caption: editValues.caption
        })
        .eq('id', editingImage);

      setImages(images.map(img =>
        img.id === editingImage
          ? { ...img, alt_text: editValues.alt_text, caption: editValues.caption }
          : img
      ));

      setEditingImage(null);
      if (onGalleryUpdate) onGalleryUpdate();
    } catch (error) {
      console.error('Error updating metadata:', error);
      alert('Failed to update metadata');
    }
  }

  function startEditMetadata(image: PostImage) {
    setEditingImage(image.id);
    setEditValues({
      alt_text: image.alt_text || '',
      caption: image.caption || ''
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="gallery-upload"
        />
        <label
          htmlFor="gallery-upload"
          className="cursor-pointer block"
        >
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF up to 10MB (multiple files supported)
          </p>
        </label>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIndex !== null) {
                  handleReorder(draggedIndex, index);
                  setDraggedIndex(null);
                }
              }}
              className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-colors cursor-move"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.thumbnail_url || image.image_url}
                  alt={image.alt_text || 'Gallery image'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2">
                <button
                  onClick={() => startEditMetadata(image)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg hover:bg-gray-100"
                  title="Edit metadata"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(image.id, image.image_url)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  title="Delete"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drag Handle */}
              <div className="absolute top-2 left-2 p-1 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} className="text-gray-600" />
              </div>

              {/* Order Badge */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Edit Image Metadata</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editValues.alt_text}
                  onChange={(e) => setEditValues({ ...editValues, alt_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Describe this image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <textarea
                  value={editValues.caption}
                  onChange={(e) => setEditValues({ ...editValues, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Add a caption"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveMetadata}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={() => setEditingImage(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-center text-gray-500 py-8">
          No images yet. Upload some to get started!
        </p>
      )}
    </div>
  );
}