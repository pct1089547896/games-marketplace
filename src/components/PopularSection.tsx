import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Game, Program } from '../types';
import ContentCard from './ContentCard';
import { TrendingUp, Clock, Award } from 'lucide-react';

interface PopularSectionProps {
  contentType: 'game' | 'program';
  timeRange?: 'week' | 'month' | 'all';
  limit?: number;
}

export default function PopularSection({ 
  contentType, 
  timeRange = 'week', 
  limit = 6 
}: PopularSectionProps) {
  const { t } = useTranslation();
  const [popular, setPopular] = useState<(Game | Program)[]>([]);
  const [recent, setRecent] = useState<(Game | Program)[]>([]);
  const [topRated, setTopRated] = useState<(Game | Program)[]>([]);
  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'topRated'>('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularContent();
  }, [contentType, timeRange]);

  async function fetchPopularContent() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-popular-content', {
        body: {
          contentType,
          timeRange,
          limit
        }
      });

      if (error) throw error;

      if (data?.data) {
        setPopular(data.data.popular || []);
        setRecent(data.data.recent || []);
        setTopRated(data.data.topRated || []);
      }
    } catch (error) {
      console.error('Error fetching popular content:', error);
      // Fallback to direct database query
      const tableName = contentType === 'game' ? 'games' : 'programs';
      const { data } = await supabase
        .from(tableName)
        .select('*')
        .order('download_count', { ascending: false })
        .limit(limit);
      setPopular(data || []);
    } finally {
      setLoading(false);
    }
  }

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'popular':
        return popular;
      case 'recent':
        return recent;
      case 'topRated':
        return topRated;
      default:
        return popular;
    }
  };

  const tabs = [
    { key: 'popular' as const, label: t('common.popular'), icon: TrendingUp },
    { key: 'recent' as const, label: t('common.recent'), icon: Clock },
    { key: 'topRated' as const, label: t('common.topRated'), icon: Award },
  ];

  return (
    <div className="mb-12">
      {/* Tab Navigation */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-600">{t('common.loading')}</div>
      ) : getCurrentContent().length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          {t('common.noContentAvailable')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentContent().map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              type={contentType}
            />
          ))}
        </div>
      )}
    </div>
  );
}
