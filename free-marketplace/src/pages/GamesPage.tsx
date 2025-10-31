import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContentCard from '../components/ContentCard';
import AdvancedFilters, { FilterState } from '../components/AdvancedFilters';
import { supabase } from '../lib/supabase';
import { Game } from '../types';

export default function GamesPage() {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
      setFilteredGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(filters: FilterState) {
    let filtered = [...games];

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.description?.toLowerCase().includes(query)
      );
    }

    // Category
    if (filters.category) {
      filtered = filtered.filter(game => game.category === filters.category);
    }

    // Platforms
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(game =>
        game.platform?.some(p => filters.platforms.includes(p))
      );
    }

    // Tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(game =>
        game.tags?.some(t => filters.tags.includes(t))
      );
    }

    // Min Rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(game => game.average_rating >= filters.minRating);
    }

    // Sort
    switch (filters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'downloads':
        filtered.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredGames(filtered);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 sm:mb-8">{t('games.title')}</h1>

        {/* Advanced Filters */}
        <AdvancedFilters onFilterChange={handleFilterChange} contentType="game" />

        {loading ? (
          <div className="text-center py-8 sm:py-12 text-gray-600">{t('games.loading')}</div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-600">
            {t('games.noGamesFound')}
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600">
              {t('games.showing')} {filteredGames.length} {filteredGames.length === 1 ? t('games.game') : t('games.games')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredGames.map((game) => (
                <ContentCard
                  key={game.id}
                  item={game}
                  type="game"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
