import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';
import TruncatedRichContent from './TruncatedRichContent';
import { Game, Program } from '../types';
import { supabase } from '../lib/supabase';

interface ContentCardProps {
  item: Game | Program | any;
  type: 'game' | 'program' | 'blog';
}

export default function ContentCard({ item, type }: ContentCardProps) {
  const { t } = useTranslation();
  const [galleryCount, setGalleryCount] = useState(0);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const linkPath = type === 'blog' ? `/blog/${item.id}` : `/${type}s/${item.id}`;
  const imageUrl = item.screenshots?.[0] || item.featured_image || 'https://via.placeholder.com/400x300?text=No+Image';

  useEffect(() => {
    if (item.id) {
      fetchGalleryPreview();
    }
  }, [item.id]);

  async function fetchGalleryPreview() {
    try {
      const postType = type === 'game' ? 'game' : type === 'program' ? 'program' : 'blog';
      const { data, error } = await supabase
        .from('post_images')
        .select('thumbnail_url, image_url')
        .eq('post_id', item.id)
        .eq('post_type', postType)
        .order('display_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setGalleryCount(data.length);
        setGalleryPreviews(data.map(img => img.thumbnail_url || img.image_url).slice(0, 3));
      }
    } catch (error) {
      // Silently fail - gallery is optional
      console.log('Gallery preview fetch:', error);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full mx-1">
      <div className="relative h-40 sm:h-48 bg-gray-100">
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        {item.category && (
          <div className="absolute top-2 right-2 bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium">
            {item.category}
          </div>
        )}
        {(type === 'game' || type === 'program') && (
          <div className="absolute top-2 left-2">
            <FavoriteButton contentId={item.id} contentType={type} size={18} />
          </div>
        )}
        {/* Gallery Preview Badge */}
        {galleryCount > 0 && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-black bg-opacity-80 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Image size={14} />
              <span>{galleryCount} {galleryCount === 1 ? 'photo' : 'photos'}</span>
            </div>
          </div>
        )}
        {/* Gallery Preview Thumbnails */}
        {galleryPreviews.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {galleryPreviews.map((preview, index) => (
              <div
                key={index}
                className="w-10 h-10 rounded border-2 border-white shadow-lg overflow-hidden"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {galleryCount > 3 && (
              <div className="w-10 h-10 rounded border-2 border-white bg-black bg-opacity-70 text-white flex items-center justify-center text-xs font-bold">
                +{galleryCount - 3}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <Link to={linkPath}>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 hover:text-gray-600 transition">
            {item.title}
          </h3>
        </Link>
        
        <div className="text-gray-600 mb-4 line-clamp-3 flex-1">
          <TruncatedRichContent 
            content={item.description || item.content || ''}
            maxLength={150}
            className="text-gray-600"
          />
        </div>

        {type === 'blog' && (
          <div className="text-sm text-gray-500 mb-4">
            <div>{t('common.by')} {item.author}</div>
            <div>{new Date(item.publish_date || '').toLocaleDateString()}</div>
          </div>
        )}

        {(type === 'game' || type === 'program') && (
          <>
            {/* Rating Display */}
            {item.average_rating > 0 && (
              <div className="mb-3">
                <StarRating 
                  rating={item.average_rating} 
                  totalRatings={item.total_ratings}
                  size={14}
                />
              </div>
            )}

            <div className="flex items-center gap-2 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-500">
              {item.view_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{item.view_count}</span>
                </div>
              )}
              {item.download_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Download size={14} />
                  <span>{item.download_count}</span>
                </div>
              )}
            </div>

            <Link
              to={linkPath}
              className="w-full bg-black text-white text-center px-3 sm:px-4 py-2 rounded font-medium hover:bg-gray-800 transition inline-flex items-center justify-center gap-2 text-sm"
            >
              <Download size={16} />
              {t('games.download')}
            </Link>
          </>
        )}

        {type === 'blog' && (
          <Link
            to={linkPath}
            className="w-full bg-black text-white text-center px-3 sm:px-4 py-2 rounded font-medium hover:bg-gray-800 transition text-sm"
          >
            {t('blog.readMore')}
          </Link>
        )}
      </div>
    </div>
  );
}
