import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  contentType: 'game' | 'program';
}

export interface FilterState {
  searchQuery: string;
  category: string;
  platforms: string[];
  tags: string[];
  minRating: number;
  sortBy: string;
}

const GAME_CATEGORIES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 'Sports', 'Racing', 'Simulation'
];

const PROGRAM_CATEGORIES = [
  'Productivity', 'Design', 'Development', 'Utilities', 'Education', 'Communication'
];

const PLATFORMS = ['Windows', 'Mac', 'Linux'];

const COMMON_TAGS = [
  'Free', 'Open Source', 'Offline', 'Multiplayer', 'Single Player', 
  'Recommended', 'New', 'Updated'
];

export default function AdvancedFilters({ onFilterChange, contentType }: AdvancedFiltersProps) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    platforms: [],
    tags: [],
    minRating: 0,
    sortBy: 'recent'
  });

  const categories = contentType === 'game' ? GAME_CATEGORIES : PROGRAM_CATEGORIES;

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const togglePlatform = (platform: string) => {
    const platforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    updateFilters({ platforms });
  };

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags });
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      searchQuery: '',
      category: '',
      platforms: [],
      tags: [],
      minRating: 0,
      sortBy: 'recent'
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = 
    (filters.category ? 1 : 0) +
    filters.platforms.length +
    filters.tags.length +
    (filters.minRating > 0 ? 1 : 0);

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            placeholder={contentType === 'game' ? t('games.searchPlaceholder') : t('programs.searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          <SlidersHorizontal size={20} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Advanced Filters</h3>
            <div className="flex gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition"
                >
                  <X size={18} />
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="recent">Recently Added</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="title">Name (A-Z)</option>
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => updateFilters({ minRating: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars Only</option>
              </select>
            </div>

            {/* Platforms */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filters.platforms.includes(platform)
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
