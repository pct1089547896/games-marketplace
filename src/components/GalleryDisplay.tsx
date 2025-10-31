import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PostImage {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
}

interface GalleryDisplayProps {
  postId: string;
  postType: 'game' | 'program' | 'blog';
  layout?: 'grid' | 'carousel' | 'masonry' | 'slideshow';
  theme?: 'default' | 'dark' | 'minimal';
}

export default function GalleryDisplay({
  postId,
  postType,
  layout = 'grid',
  theme = 'default'
}: GalleryDisplayProps) {
  const [images, setImages] = useState<PostImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchImages();
  }, [postId]);

  useEffect(() => {
    // Auto-advance slideshow
    if (layout === 'slideshow' && images.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [layout, images.length]);

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
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction: 'prev' | 'next') {
    if (lightboxIndex === null) return;
    
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    } else {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  // Grid Layout
  if (layout === 'grid') {
    return (
      <div className={`gallery-grid ${theme}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg"
            >
              <img
                src={image.thumbnail_url || image.image_url}
                alt={image.alt_text || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        {renderLightbox()}
      </div>
    );
  }

  // Carousel Layout
  if (layout === 'carousel') {
    return (
      <div className={`gallery-carousel ${theme} relative`}>
        <div className="relative overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="min-w-full aspect-video flex-shrink-0"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Slide ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition"
              >
                <ChevronRight size={24} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        {renderLightbox()}
      </div>
    );
  }

  // Masonry Layout
  if (layout === 'masonry') {
    return (
      <div className={`gallery-masonry ${theme}`}>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-lg"
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `Gallery image ${index + 1}`}
                className="w-full h-auto transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        {renderLightbox()}
      </div>
    );
  }

  // Slideshow Layout
  if (layout === 'slideshow') {
    return (
      <div className={`gallery-slideshow ${theme} relative`}>
        <div className="relative aspect-video rounded-lg overflow-hidden">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `Slide ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-6">
                  <p className="text-lg font-medium">{image.caption}</p>
                </div>
              )}
            </div>
          ))}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30">
            <div
              className="h-full bg-white transition-all duration-5000"
              style={{ width: `${((currentSlide + 1) / images.length) * 100}%` }}
            />
          </div>
        </div>
        {renderLightbox()}
      </div>
    );
  }

  function renderLightbox() {
    if (lightboxIndex === null) return null;

    const currentImage = images[lightboxIndex];

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
        onClick={closeLightbox}
      >
        {/* Close Button */}
        <button
          onClick={closeLightbox}
          className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition z-10"
        >
          <X size={32} />
        </button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('prev');
              }}
              className="absolute left-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <ChevronLeft size={48} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('next');
              }}
              className="absolute right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <ChevronRight size={48} />
            </button>
          </>
        )}

        {/* Image */}
        <div
          className="max-w-7xl max-h-full flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentImage.image_url}
            alt={currentImage.alt_text || `Image ${lightboxIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
          />
          
          {/* Caption */}
          {currentImage.caption && (
            <div className="mt-4 text-white text-center">
              <p className="text-lg">{currentImage.caption}</p>
            </div>
          )}

          {/* Counter */}
          <div className="mt-4 text-white text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>

        {/* Keyboard Navigation Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm opacity-50">
          Use arrow keys to navigate
        </div>
      </div>
    );
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  return null;
}