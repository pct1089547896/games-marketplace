import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import ContentCard from '../components/ContentCard';
import PopularSection from '../components/PopularSection';

import { CommunityActivityFeed } from '../components/CommunityActivityFeed';
import { supabase } from '../lib/supabase';
import { Game, Program, BlogPost } from '../types';

export default function HomePage() {
  const { t } = useTranslation();
  const [latestGames, setLatestGames] = useState<Game[]>([]);
  const [latestPrograms, setLatestPrograms] = useState<Program[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      const [gamesRes, programsRes, blogsRes] = await Promise.all([
        supabase.from('games').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('programs').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('blog_posts').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
      ]);

      if (gamesRes.data) setLatestGames(gamesRes.data);
      if (programsRes.data) setLatestPrograms(programsRes.data);
      if (blogsRes.data) setLatestBlogs(blogsRes.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero />

      {/* Popular Games Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6 sm:mb-8">{t('home.popularGames')}</h2>
          <PopularSection contentType="game" timeRange="week" limit={6} />
        </div>
      </section>

      {/* Latest Games Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{t('home.latestGames')}</h2>
            <Link to="/games" className="text-black font-medium hover:text-gray-600 transition text-sm sm:text-base">
              {t('home.viewAllGames')}
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-600">{t('home.loadingGames')}</div>
          ) : latestGames.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-600">{t('home.noGamesYet')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {latestGames.map((game) => (
                <ContentCard
                  key={game.id}
                  item={game}
                  type="game"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Programs Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{t('home.latestPrograms')}</h2>
            <Link to="/programs" className="text-black font-medium hover:text-gray-600 transition text-sm sm:text-base">
              {t('home.viewAllPrograms')}
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-600">{t('home.loadingPrograms')}</div>
          ) : latestPrograms.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-600">{t('home.noProgramsYet')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {latestPrograms.map((program) => (
                <ContentCard
                  key={program.id}
                  item={program}
                  type="program"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">{t('home.latestNews')}</h2>
            <Link to="/blog" className="text-black font-medium hover:text-gray-600 transition text-sm sm:text-base">
              {t('home.viewAllPosts')}
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-600">{t('home.loadingPosts')}</div>
          ) : latestBlogs.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-600">{t('home.noPostsYet')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {latestBlogs.map((post) => (
                <ContentCard
                  key={post.id}
                  item={post}
                  type="blog"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Activity Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <CommunityActivityFeed />
        </div>
      </section>


    </div>
  );
}
