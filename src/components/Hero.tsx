import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Game, Program } from '../types';

interface HeroSettings {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  layout_template: 'centered' | 'split' | 'fullwidth' | 'minimal';
  background_type: 'image' | 'video' | 'gradient' | 'color';
  background_media_url: string;
  background_color: string;
  background_gradient: string;
  text_position: 'center' | 'left' | 'right';
  text_color: string;
  featured_content_ids: string[];
  display_featured_content: boolean;
  featured_content_layout: 'single' | 'carousel' | 'grid';
}

export default function Hero() {
  const { t } = useTranslation();
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
  const [featuredContent, setFeaturedContent] = useState<(Game | Program)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  async function fetchHeroSettings() {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHeroSettings(data);
        
        // Load featured content if enabled
        if (data.display_featured_content && data.featured_content_ids?.length > 0) {
          await loadFeaturedContent(data.featured_content_ids);
        }
      } else {
        // Fallback to default behavior if no hero settings found
        await loadDefaultHero();
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      await loadDefaultHero();
    } finally {
      setLoading(false);
    }
  }

  async function loadFeaturedContent(ids: string[]) {
    try {
      const [gamesRes, programsRes] = await Promise.all([
        supabase.from('games').select('*').in('id', ids),
        supabase.from('programs').select('*').in('id', ids),
      ]);

      const games = gamesRes.data || [];
      const programs = programsRes.data || [];
      setFeaturedContent([...games, ...programs]);
    } catch (error) {
      console.error('Error loading featured content:', error);
    }
  }

  async function loadDefaultHero() {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setFeaturedContent(data || []);
    } catch (error) {
      console.error('Error fetching featured games:', error);
    }
  }

  const nextSlide = () => {
    if (featuredContent.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
    }
  };

  const prevSlide = () => {
    if (featuredContent.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
    }
  };

  useEffect(() => {
    if (featuredContent.length > 1 && heroSettings?.featured_content_layout === 'carousel') {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredContent.length, heroSettings?.featured_content_layout]);

  if (loading) {
    return (
      <div className="bg-black text-white py-32 flex items-center justify-center">
        <div className="text-xl">{t('home.hero.loadingFeatured')}</div>
      </div>
    );
  }

  // Custom hero from admin settings
  if (heroSettings) {
    const backgroundStyle: React.CSSProperties = {
      background:
        heroSettings.background_type === 'color'
          ? heroSettings.background_color
          : heroSettings.background_type === 'gradient'
          ? heroSettings.background_gradient
          : '#000000',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    const textAlignClass =
      heroSettings.text_position === 'center'
        ? 'items-center text-center'
        : heroSettings.text_position === 'left'
        ? 'items-start text-left'
        : 'items-end text-right';

    // Centered Layout
    if (heroSettings.layout_template === 'centered') {
      return (
        <div className="relative bg-black text-white overflow-hidden" style={backgroundStyle}>
          {/* Video Background */}
          {heroSettings.background_type === 'video' && heroSettings.background_media_url && (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src={heroSettings.background_media_url} type="video/mp4" />
            </video>
          )}
          
          {/* Image Background */}
          {heroSettings.background_type === 'image' && heroSettings.background_media_url && (
            <div 
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{
                backgroundImage: `url(${heroSettings.background_media_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className={`flex flex-col ${textAlignClass}`}>
              <h1 className="text-6xl font-bold mb-6 leading-tight" style={{ color: heroSettings.text_color }}>
                {heroSettings.title}
              </h1>
              {heroSettings.subtitle && (
                <p className="text-2xl mb-8 max-w-3xl" style={{ color: heroSettings.text_color }}>
                  {heroSettings.subtitle}
                </p>
              )}
              <div className="flex gap-4">
                {heroSettings.cta_text && heroSettings.cta_link && (
                  <Link
                    to={heroSettings.cta_link}
                    className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition"
                  >
                    {heroSettings.cta_text}
                  </Link>
                )}
                {heroSettings.secondary_cta_text && heroSettings.secondary_cta_link && (
                  <Link
                    to={heroSettings.secondary_cta_link}
                    className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
                    style={{ color: heroSettings.text_color }}
                  >
                    {heroSettings.secondary_cta_text}
                  </Link>
                )}
              </div>
            </div>

            {/* Featured Content */}
            {heroSettings.display_featured_content && featuredContent.length > 0 && (
              <div className="mt-16">
                {heroSettings.featured_content_layout === 'carousel' && (
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {featuredContent.slice(0, 3).map((item) => (
                        <FeaturedContentCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
                {heroSettings.featured_content_layout === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {featuredContent.slice(0, 4).map((item) => (
                      <FeaturedContentCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
                {heroSettings.featured_content_layout === 'single' && featuredContent[0] && (
                  <div className="max-w-md mx-auto">
                    <FeaturedContentCard item={featuredContent[0]} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Split Layout
    if (heroSettings.layout_template === 'split') {
      return (
        <div className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6" style={{ color: heroSettings.text_color }}>
                  {heroSettings.title}
                </h1>
                {heroSettings.subtitle && (
                  <p className="text-xl mb-8" style={{ color: heroSettings.text_color }}>
                    {heroSettings.subtitle}
                  </p>
                )}
                <div className="flex gap-4">
                  {heroSettings.cta_text && heroSettings.cta_link && (
                    <Link
                      to={heroSettings.cta_link}
                      className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                    >
                      {heroSettings.cta_text}
                    </Link>
                  )}
                  {heroSettings.secondary_cta_text && heroSettings.secondary_cta_link && (
                    <Link
                      to={heroSettings.secondary_cta_link}
                      className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition"
                      style={{ color: heroSettings.text_color }}
                    >
                      {heroSettings.secondary_cta_text}
                    </Link>
                  )}
                </div>
              </div>
              <div>
                {heroSettings.background_media_url && heroSettings.background_type === 'image' && (
                  <img
                    src={heroSettings.background_media_url}
                    alt="Hero"
                    className="w-full h-96 object-cover rounded-lg"
                  />
                )}
                {heroSettings.background_media_url && heroSettings.background_type === 'video' && (
                  <video
                    src={heroSettings.background_media_url}
                    className="w-full h-96 object-cover rounded-lg"
                    controls
                    muted
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fullwidth Layout
    if (heroSettings.layout_template === 'fullwidth') {
      return (
        <div className="relative bg-black text-white min-h-screen flex items-center" style={backgroundStyle}>
          {/* Video Background */}
          {heroSettings.background_type === 'video' && heroSettings.background_media_url && (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src={heroSettings.background_media_url} type="video/mp4" />
            </video>
          )}
          
          {/* Image Background */}
          {heroSettings.background_type === 'image' && heroSettings.background_media_url && (
            <div 
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{
                backgroundImage: `url(${heroSettings.background_media_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
          <div className="relative z-10 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
              <div className={`flex flex-col ${textAlignClass}`}>
                <h1 className="text-7xl font-bold mb-6" style={{ color: heroSettings.text_color }}>
                  {heroSettings.title}
                </h1>
                {heroSettings.subtitle && (
                  <p className="text-2xl mb-8 max-w-3xl" style={{ color: heroSettings.text_color }}>
                    {heroSettings.subtitle}
                  </p>
                )}
                <div className="flex gap-4">
                  {heroSettings.cta_text && heroSettings.cta_link && (
                    <Link
                      to={heroSettings.cta_link}
                      className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition"
                    >
                      {heroSettings.cta_text}
                    </Link>
                  )}
                  {heroSettings.secondary_cta_text && heroSettings.secondary_cta_link && (
                    <Link
                      to={heroSettings.secondary_cta_link}
                      className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
                      style={{ color: heroSettings.text_color }}
                    >
                      {heroSettings.secondary_cta_text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Minimal Layout
    if (heroSettings.layout_template === 'minimal') {
      return (
        <div className="bg-black text-white py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-6xl font-bold mb-6" style={{ color: heroSettings.text_color }}>
              {heroSettings.title}
            </h1>
            {heroSettings.subtitle && (
              <p className="text-xl mb-8" style={{ color: heroSettings.text_color }}>
                {heroSettings.subtitle}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              {heroSettings.cta_text && heroSettings.cta_link && (
                <Link
                  to={heroSettings.cta_link}
                  className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                  {heroSettings.cta_text}
                </Link>
              )}
              {heroSettings.secondary_cta_text && heroSettings.secondary_cta_link && (
                <Link
                  to={heroSettings.secondary_cta_link}
                  className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition"
                  style={{ color: heroSettings.text_color }}
                >
                  {heroSettings.secondary_cta_text}
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // Default fallback hero
  if (featuredContent.length === 0) {
    return (
      <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-bold mb-6">
            {t('home.hero.welcome')}
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            {t('home.hero.destination')}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/games"
              className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition"
            >
              {t('home.hero.browseGames')}
            </Link>
            <Link
              to="/programs"
              className="bg-gray-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-700 transition border border-white"
            >
              {t('home.hero.browsePrograms')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default featured games carousel
  const currentItem = featuredContent[currentIndex];

  return (
    <div className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        {currentItem.screenshots && currentItem.screenshots[0] && (
          <img
            src={currentItem.screenshots[0]}
            alt={currentItem.title}
            className="w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold mb-2 text-gray-300 uppercase tracking-wider">
            {t('home.hero.featuredGame')}
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            {currentItem.title}
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {currentItem.description}
          </p>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Eye size={20} className="text-gray-400" />
              <span className="text-gray-300">{currentItem.view_count} {t('common.views')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download size={20} className="text-gray-400" />
              <span className="text-gray-300">{currentItem.download_count} {t('common.downloads')}</span>
            </div>
            <div className="bg-gray-800 px-3 py-1 rounded text-sm">
              {currentItem.category}
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href={currentItem.download_link}
              className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition inline-flex items-center gap-2"
            >
              <Download size={20} />
              {t('home.hero.downloadNow')}
            </a>
            <Link
              to={`/games/${currentItem.id}`}
              className="bg-gray-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-700 transition border border-white"
            >
              {t('home.hero.learnMore')}
            </Link>
          </div>
        </div>
      </div>

      {featuredContent.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {featuredContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Featured Content Card Component
function FeaturedContentCard({ item }: { item: Game | Program }) {
  return (
    <Link
      to={`/games/${item.id}`}
      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition"
    >
      {item.screenshots && item.screenshots[0] && (
        <img
          src={item.screenshots[0]}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
        <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>
      </div>
    </Link>
  );
}
