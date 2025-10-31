import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContentCard from '../components/ContentCard';
import AdvancedFilters, { FilterState } from '../components/AdvancedFilters';
import { supabase } from '../lib/supabase';
import { Program } from '../types';

export default function ProgramsPage() {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
      setFilteredPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(filters: FilterState) {
    let filtered = [...programs];

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(query) ||
        program.description?.toLowerCase().includes(query)
      );
    }

    // Category
    if (filters.category) {
      filtered = filtered.filter(program => program.category === filters.category);
    }

    // Platforms
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(program =>
        program.platform?.some(p => filters.platforms.includes(p))
      );
    }

    // Tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(program =>
        program.tags?.some(t => filters.tags.includes(t))
      );
    }

    // Min Rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(program => program.average_rating >= filters.minRating);
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

    setFilteredPrograms(filtered);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 sm:mb-8">{t('programs.title')}</h1>

        {/* Advanced Filters */}
        <AdvancedFilters onFilterChange={handleFilterChange} contentType="program" />

        {loading ? (
          <div className="text-center py-8 sm:py-12 text-gray-600">{t('programs.loading')}</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-600">
            {t('programs.noProgramsFound')}
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600">
              {t('programs.showing')} {filteredPrograms.length} {filteredPrograms.length === 1 ? t('programs.program') : t('programs.programs')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPrograms.map((program) => (
                <ContentCard
                  key={program.id}
                  item={program}
                  type="program"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
